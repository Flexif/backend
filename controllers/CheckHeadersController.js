const axios = require("axios");
const tls = require("tls");
const { URL } = require("url");
const { parse } = require("node-html-parser");

// Function to get SSL/TLS info

const getSslTlsInfo = async (hostname) => {
  return new Promise((resolve, reject) => {
    // You can adjust minVersion here to support lower versions like 'TLSv1.0'
    const options = {
      host: hostname,
      port: 443,
      servername: hostname,
      minVersion: "TLSv1.2", // Set to 'TLSv1.0' or 'TLSv1.1' if needed
      maxVersion: "TLSv1.3", // This allows up to TLSv1.3
      rejectUnauthorized: false, // Set to true in production
    };

    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate();
      const protocol = socket.getProtocol();
      

      resolve({
        protocol: protocol,
        cipher: socket.getCipher(),
        // Exclude peerCertificate.raw.data from response
        peerCertificate: {
          subject: cert.subject,
          issuer: cert.issuer,
          valid_from: cert.valid_from,
          valid_to: cert.valid_to,
          serialNumber: cert.serialNumber,
          fingerprint: cert.fingerprint,
          version: cert.version,
          // Other relevant info but not raw data
        },
        sniSupported: options.servername
          ? "SNI supported"
          : "SNI not supported",
      });

      socket.end();
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err.message);
      reject(err);
    });

    socket.on("close", () => {
    });

    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("Connection timed out"));
    });
  });
};

// Function to check CORS
const checkCORS = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: { Origin: "https://punchoutcheck.onrender.com" },
    });
    const headers = response.headers;
    return {
      corsHeaders: {
        "Access-Control-Allow-Origin": headers["access-control-allow-origin"],
        "Access-Control-Allow-Methods": headers["access-control-allow-methods"],
        "Access-Control-Allow-Headers": headers["access-control-allow-headers"],
      },
      status: response.status,
    };
  } catch (error) {
    return {
      corsHeaders: { error: error.message },
      status: error.response ? error.response.status : 500,
    };
  }
};

// Function to check mixed content and iframes
const checkMixedContentAndIframes = async (url) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const root = parse(html);

    const mixedContent = html.includes("http://")
      ? "Mixed content detected"
      : "None";

    const iframes = root.querySelectorAll("iframe").map((iframe) => ({
      src: iframe.getAttribute("src"),
      isSecure: iframe.getAttribute("src")?.startsWith("https://"),
      attributes: {
        width: iframe.getAttribute("width"),
        height: iframe.getAttribute("height"),
        frameborder: iframe.getAttribute("frameborder"),
      },
    }));

    const iframeResult = iframes.length > 0 ? iframes : "None";

    return {
      mixedContent: mixedContent,
      iframes: iframeResult,
    };
  } catch (error) {
    return {
      mixedContent: "Mixed content detected",
      iframes: "None",
    };
  }
};

// Function to check SameSite cookies
const checkSameSiteCookies = (headers) => {
  const cookies = headers["set-cookie"] || [];
  const sameSiteValues = cookies.map((cookie) => {
    const sameSiteMatch = /;\s*SameSite=([^;\s]+)/.exec(cookie);
    return sameSiteMatch ? sameSiteMatch[1] : "Unknown";
  });

  return sameSiteValues.length > 0 ? sameSiteValues.join(", ") + "" : "None";
};

// Retry mechanism function
const fetchWithRetry = async (url, retries = 2, delay = 1000) => {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    return response;
  } catch (error) {
    console.error("Error during request:", error.message);
    if (retries > 0 && error.code === "ECONNRESET") {
      await new Promise((res) => setTimeout(res, delay));
      return fetchWithRetry(url, retries - 1, delay);
    }
    throw error; // If retries are exhausted or it's another error, throw
  }
};

// Main controller function
const CheckHeaders = async (req, res) => {

  const { punchoutURL } = req.body;
  if (!punchoutURL) {
    return res.status(400).json({ error: "URL is required" });
  }

  let url = punchoutURL;

  // Force HTTPS if HTTP is detected
  if (url.startsWith("http://")) {
    url = url.replace("http://", "https://");
  }

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // Retry mechanism for HTTPS requests
    const headersResponse = await fetchWithRetry(url);
    const headers = headersResponse.headers;

    // SSL/TLS check
    const sslTlsInfo = await getSslTlsInfo(hostname);

    // CORS check
    const corsInfo = await checkCORS(url);

    // Mixed content and iframe check
    const mixedContentAndIframes = await checkMixedContentAndIframes(url);

    // SameSite cookie check
    const sameSiteCookies = checkSameSiteCookies(headers);

    // X-Frame-Options check
    const xFrameOptions = headers["x-frame-options"] || "Not set";

    // Respond with all gathered information
    res.status(200).json({
      httpHeaders: headers,
      sslTlsInfo: sslTlsInfo,
      corsInfo: corsInfo,
      mixedContent: mixedContentAndIframes.mixedContent,
      iframes: mixedContentAndIframes.iframes,
      sameSiteCookies: sameSiteCookies,
      xFrameOptions: xFrameOptions,
    });
  } catch (error) {
    console.error("Error during CheckHeaders:", error.message);

    // Determine if it's a connection reset or firewall issue
    let errorDetails;
    if (error.code === "ECONNRESET") {
      errorDetails =
        ": Possible causes include the server blocking the request or firewall issues (such as IP whitelisting).";
    } else if (error.code === "ENOTFOUND") {
      errorDetails =
        ": Hostname could not be found. The URL might be invalid or blocked by a firewall (such as IP whitelisting).";
    } else if (error.message.includes("timeout")) {
      errorDetails =
        ": Request timed out. The server may not be reachable, or the request was blocked by a firewall (such as IP whitelisting).";
    } else {
      errorDetails = error.message;
    }

    // Send a detailed error message to the frontend
    res.status(500).json({
      error: error.message,
      details: errorDetails,
    });
  }
};

module.exports = { CheckHeaders };
