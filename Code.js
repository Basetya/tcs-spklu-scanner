/**
 * PT. Titis Cahaya Sejahtera (TCS) - Web Application Server Code
 * Platform: Google Apps Script Web App Ecosystem
 * Author: Antigravity AI
 * 
 * CONFIGURATION: Paste your Google Spreadsheet ID here to sync leads and settings.
 * Pre-populated with your spreadsheet ID from your screenshots!
 */
var TCS_SPREADSHEET_ID = "1AOUFPczcP6ZYFcQnppbdLLaGyXWAnYW6yT2_2et8yPc";

/**
 * Helper to retrieve the target Google Spreadsheet instance.
 * Resolves priority order: Configured ID -> Container-Bound -> Standalone File Search.
 * @return {Spreadsheet} The Spreadsheet instance or null if not found.
 */
function getTcsSpreadsheet() {
  var ss = null;
  
  // 1. Try to open using the configured Spreadsheet ID (highly recommended for Web App context)
  if (typeof TCS_SPREADSHEET_ID !== 'undefined' && TCS_SPREADSHEET_ID) {
    try {
      ss = SpreadsheetApp.openById(TCS_SPREADSHEET_ID);
      if (ss) return ss;
    } catch (e) {
      console.warn("Failed to open spreadsheet by ID: " + e.message);
    }
  }

  // 2. Try to get container-bound active spreadsheet
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (e) {
    console.warn("SpreadsheetApp.getActiveSpreadsheet() failed: " + e.message);
  }

  // 3. Fallback: Search or create a standalone file named "TCS Leads Tracker"
  try {
    var files = DriveApp.getFilesByName("TCS Leads Tracker");
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create("TCS Leads Tracker");
    }
  } catch (e) {
    console.error("DriveApp spreadsheet retrieval/creation failed: " + e.message);
  }

  return ss;
}


/**
 * Serves the web application
 * Supports query parameters for routing, e.g. ?page=spklu
 */
function doGet(e) {
  try {
    var page = e && e.parameter && e.parameter.page ? e.parameter.page : 'index';
    if (page.toLowerCase() === 'spklu') {
      try {
        return HtmlService.createTemplateFromFile('Spklu')
          .evaluate()
          .setTitle('Kemitraan SPKLU - PT. Titis Cahaya Sejahtera')
          .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      } catch (err) {
        console.error("Failed to evaluate Spklu template:", err);
        return HtmlService.createHtmlOutput(
          "<html><body style='font-family:sans-serif; padding:30px; background:#fafafa;'><h1 style='color:#dc2626;'>Server-side Template Evaluation Error (Spklu)</h1><p>An error occurred while compiling/rendering <b>Spklu.html</b>:</p><pre style='background:#fee2e2; border:1px solid #fca5a5; padding:15px; border-radius:6px; overflow:auto; font-family:monospace; color:#991b1b;'>" + 
          err.toString() + "\n\nStack:\n" + err.stack + "</pre></body></html>"
        );
      }
    }
    try {
      return HtmlService.createTemplateFromFile('Index')
        .evaluate()
        .setTitle('PT. Titis Cahaya Sejahtera - MEP Contractor')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (err) {
      console.error("Failed to evaluate Index template:", err);
      return HtmlService.createHtmlOutput(
        "<html><body style='font-family:sans-serif; padding:30px; background:#fafafa;'><h1 style='color:#dc2626;'>Server-side Template Evaluation Error (Index)</h1><p>An error occurred while compiling/rendering <b>Index.html</b>:</p><pre style='background:#fee2e2; border:1px solid #fca5a5; padding:15px; border-radius:6px; overflow:auto; font-family:monospace; color:#991b1b;'>" + 
        err.toString() + "\n\nStack:\n" + err.stack + "</pre></body></html>"
      );
    }
  } catch (globalErr) {
    return HtmlService.createHtmlOutput(
      "<html><body style='font-family:sans-serif; padding:30px; background:#fafafa;'><h1 style='color:#dc2626;'>Global doGet Error</h1><pre style='background:#fee2e2; border:1px solid #fca5a5; padding:15px; border-radius:6px; overflow:auto; font-family:monospace; color:#991b1b;'>" + 
      globalErr.toString() + "</pre></body></html>"
    );
  }
}

/**
 * Helper function to embed CSS and JS files inline in the template
 * @param {string} filename - The name of the file to include (without .html extension)
 * @return {string} The content of the file
 */
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (err) {
    console.error("Failed to include file: " + filename + ". Error: " + err.message);
    return "<!-- ERROR: File " + filename + " not found -->";
  }
}

/**
 * Receives data from the Consultation Planner Wizard
 * Automatically saves it to a Google Sheet (Logs/Leads) and sends an email to the TCS Admin.
 * 
 * @param {Object} formData - Object containing form fields (name, company, phone, service, scale, notes)
 * @return {Object} Response status object
 */
function submitConsultation(formData) {
  try {
    var timestamp = new Date();
    var name = formData.name || "";
    var company = formData.company || "";
    var phone = formData.phone || "";
    var service = formData.service || "";
    var scale = formData.scale || "";
    var notes = formData.notes || "";
    
    // Validate required fields
    if (!name || !phone || !service) {
      return {
        success: false,
        message: "Nama, No. Telepon, dan Layanan wajib diisi."
      };
    }
    
    var logSuccess = false;
    var spreadsheetUrl = "";
    
    // 1. Log to Google Sheet (Active Spreadsheet or create one)
    try {
      var ss = getTcsSpreadsheet();
      
      if (ss) {
        var sheet = ss.getSheetByName('Consultations');
        if (!sheet) {
          sheet = ss.insertSheet('Consultations');
          // Format header row
          var headers = ['Timestamp', 'Nama Klien', 'Perusahaan', 'No. Telp / WhatsApp', 'Kategori Jasa', 'Skala Proyek', 'Catatan Tambahan'];
          sheet.appendRow(headers);
          
          // Style header row
          var headerRange = sheet.getRange(1, 1, 1, headers.length);
          headerRange.setFontWeight('bold');
          headerRange.setBackground('#00f2fe');
          headerRange.setFontColor('#0a0f1d');
          sheet.setFrozenRows(1);
        }
        
        sheet.appendRow([timestamp, name, company, phone, service, scale, notes]);
        spreadsheetUrl = ss.getUrl();
        logSuccess = true;
      }
    } catch (sheetErr) {
      console.warn("Spreadsheet logging skipped or failed: " + sheetErr.message);
    }
    
    // 2. Send email notification to Admin/Active User
    var emailSuccess = false;
    try {
      var adminEmail = Session.getActiveUser().getEmail();
      // If active user email is blank, use a default fallback
      if (!adminEmail) {
        adminEmail = "sales@titisgroup.com";
      }
      
      var subject = "[TCS Web App] Permintaan Konsultasi Baru - " + name + " (" + company + ")";
      
      // Beautiful HTML Email body
      var htmlBody = 
        "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>" +
          "<div style='background: linear-gradient(135deg, #0a0f1d 0%, #00f2fe 100%); padding: 24px; text-align: center; color: white;'>" +
            "<h2 style='margin: 0; font-size: 24px;'>PT. Titis Cahaya Sejahtera</h2>" +
            "<p style='margin: 4px 0 0 0; opacity: 0.8;'>Notifikasi Permintaan Konsultasi Baru</p>" +
          "</div>" +
          "<div style='padding: 24px; background-color: #f9f9f9; color: #333; line-height: 1.6;'>" +
            "<p style='margin-top: 0;'>Halo Tim TCS,</p>" +
            "<p>Telah masuk satu permintaan konsultasi proyek baru dari website. Berikut adalah detail lengkapnya:</p>" +
            
            "<table style='width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);'>" +
              "<tr>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; width: 35%; color: #666;'>Tanggal</td>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee;'>" + timestamp.toLocaleString('id-ID') + "</td>" +
              "</tr>" +
              "<tr>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;'>Nama Klien</td>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee; color: #0a0f1d; font-weight: bold;'>" + name + "</td>" +
              "</tr>" +
              "<tr>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;'>Perusahaan</td>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee;'>" + (company || "-") + "</td>" +
              "</tr>" +
              "<tr>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;'>WhatsApp/Telepon</td>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee;'><a href='https://wa.me/" + phone.replace(/[^0-9]/g, '') + "' style='color: #00f2fe; font-weight: bold; text-decoration: none;'>" + phone + " (Hubungi WA)</a></td>" +
              "</tr>" +
              "<tr>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;'>Kategori Jasa</td>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee; color: #089994; font-weight: bold;'>" + service + "</td>" +
              "</tr>" +
              "<tr>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;'>Skala Proyek</td>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee;'>" + scale + "</td>" +
              "</tr>" +
              "<tr>" +
                "<td style='padding: 12px; font-weight: bold; color: #666; vertical-align: top;'>Catatan Tambahan</td>" +
                "<td style='padding: 12px; white-space: pre-line;'>" + (notes || "-") + "</td>" +
              "</tr>" +
            "</table>" +
            
            (spreadsheetUrl ? ("<p style='text-align: center; margin-top: 24px;'><a href='" + spreadsheetUrl + "' style='background-color: #0a0f1d; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block;'>Buka Spreadsheet Tracker</a></p>") : "") +
          "</div>" +
          "<div style='background-color: #0a0f1d; padding: 16px; text-align: center; color: rgba(255,255,255,0.5); font-size: 12px;'>" +
            "&copy; " + timestamp.getFullYear() + " PT. Titis Cahaya Sejahtera. All rights reserved." +
          "</div>" +
        "</div>";
        
      MailApp.sendEmail({
        to: adminEmail,
        subject: subject,
        htmlBody: htmlBody
      });
      emailSuccess = true;
    } catch (mailErr) {
      console.warn("Mail notification failed: " + mailErr.message);
    }
    
    return {
      success: true,
      message: "Terima kasih #KawanTCS! Konsultasi Anda telah diterima. Tim profesional MEP kami akan segera menghubungi Anda melalui nomor telepon/WhatsApp: " + phone,
      details: {
        logged: logSuccess,
        emailed: emailSuccess
      }
    };
  } catch (err) {
    console.error("Error in submitConsultation: " + err.message);
    return {
      success: false,
      message: "Terjadi gangguan sistem: " + err.message
    };
  }
}

/**
 * Receives lead data from the SPKLU Partnership Landing Page
 * Automatically logs data to a new sheet ('SPKLU Leads') in the TCS Leads Tracker spreadsheet and sends an email notification.
 * 
 * @param {Object} leadData - Object containing form fields (name, email, phone, landAddress, notes)
 * @return {Object} Response status object
 */
function submitSpkluLead(leadData) {
  try {
    var timestamp = new Date();
    var name = leadData.name || "";
    var email = leadData.email || "";
    var phone = leadData.phone || "";
    var landAddress = leadData.landAddress || "";
    var notes = leadData.notes || "";
    
    // Validate required fields
    if (!name || !email || !phone || !landAddress) {
      return {
        success: false,
        message: "Nama, Email, No. WhatsApp, dan Alamat Lahan wajib diisi."
      };
    }
    
    var logSuccess = false;
    var spreadsheetUrl = "";
    
    // 1. Log to Google Sheet (Active Spreadsheet or create/open 'TCS Leads Tracker')
    try {
      var ss = getTcsSpreadsheet();
      
      if (ss) {
        var sheet = ss.getSheetByName('SPKLU Leads');
        if (!sheet) {
          sheet = ss.insertSheet('SPKLU Leads');
          // Format header row
          var headers = ['Timestamp', 'Nama Investor', 'Email', 'No. WhatsApp', 'Alamat/Koordinat Lahan', 'Catatan Tambahan'];
          sheet.appendRow(headers);
          
          // Style header row (Electric Green theme for SPKLU)
          var headerRange = sheet.getRange(1, 1, 1, headers.length);
          headerRange.setFontWeight('bold');
          headerRange.setBackground('#00e575');
          headerRange.setFontColor('#0a0f1d');
          sheet.setFrozenRows(1);
        }
        
        sheet.appendRow([timestamp, name, email, phone, landAddress, notes]);
        spreadsheetUrl = ss.getUrl();
        logSuccess = true;
      }
    } catch (sheetErr) {
      console.warn("Spreadsheet logging failed: " + sheetErr.message);
    }
    
    // 2. Send email notification to Admin
    var emailSuccess = false;
    try {
      var adminEmail = Session.getActiveUser().getEmail();
      if (!adminEmail) {
        adminEmail = "sales@titisgroup.com";
      }
      
      var subject = "[TCS SPKLU] Pengajuan Kemitraan Baru - " + name;
      
      // Beautiful HTML Email body with SPKLU branding
      var htmlBody = 
        "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>" +
          "<div style='background: linear-gradient(135deg, #0a0f1d 0%, #00e575 100%); padding: 24px; text-align: center; color: white;'>" +
            "<h2 style='margin: 0; font-size: 24px;'>PT. Titis Cahaya Sejahtera</h2>" +
            "<p style='margin: 4px 0 0 0; opacity: 0.9;'>Kemitraan SPKLU - Pengajuan Lahan Baru</p>" +
          "</div>" +
          "<div style='padding: 24px; background-color: #f9f9f9; color: #333; line-height: 1.6;'>" +
            "<p style='margin-top: 0;'>Halo Tim TCS,</p>" +
            "<p>Telah masuk satu pengajuan lahan kemitraan SPKLU baru dari website. Berikut adalah rincian calon investor:</p>" +
            
            "<table style='width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);'>" +
              "<tr>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; width: 35%; color: #666;'>Tanggal</td>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee;'>" + timestamp.toLocaleString('id-ID') + "</td>" +
              "</tr>" +
              "<tr>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;'>Nama Investor</td>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee; color: #0a0f1d; font-weight: bold;'>" + name + "</td>" +
              "</tr>" +
              "<tr>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;'>Email</td>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee;'><a href='mailto:" + email + "' style='color: #00e575; text-decoration: none;'>" + email + "</a></td>" +
              "</tr>" +
              "<tr>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;'>WhatsApp/Telepon</td>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee;'><a href='https://wa.me/" + phone.replace(/[^0-9]/g, '') + "' style='color: #00e575; font-weight: bold; text-decoration: none;'>" + phone + " (Hubungi WA)</a></td>" +
              "</tr>" +
              "<tr>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #666; vertical-align: top;'>Alamat Lahan</td>" +
                "<td style='padding: 12px; border-bottom: 1px solid #eee; color: #0a0f1d; font-weight: bold;'>" + landAddress + "</td>" +
              "</tr>" +
              "<tr>" +
                "<td style='padding: 12px; font-weight: bold; color: #666; vertical-align: top;'>Catatan Tambahan</td>" +
                "<td style='padding: 12px; white-space: pre-line;'>" + (notes || "-") + "</td>" +
              "</tr>" +
            "</table>" +
            
            (spreadsheetUrl ? ("<p style='text-align: center; margin-top: 24px;'><a href='" + spreadsheetUrl + "' style='background-color: #0a0f1d; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block;'>Buka Spreadsheet Tracker</a></p>") : "") +
          "</div>" +
          "<div style='background-color: #0a0f1d; padding: 16px; text-align: center; color: rgba(255,255,255,0.5); font-size: 12px;'>" +
            "&copy; " + timestamp.getFullYear() + " PT. Titis Cahaya Sejahtera. All rights reserved." +
          "</div>" +
         "</div>";
         
      MailApp.sendEmail({
        to: adminEmail,
        subject: subject,
        htmlBody: htmlBody
      });
      emailSuccess = true;
    } catch (mailErr) {
      console.warn("Mail notification failed: " + mailErr.message);
    }
    
    return {
      success: true,
      message: "Terima kasih atas minat Anda, " + name + "! Pengajuan lahan kemitraan SPKLU Anda telah kami terima secara aman. Tim kami akan segera meninjau koordinat lahan Anda. Silakan klik tombol di bawah untuk langsung berkoordinasi secara cepat dengan representatif kami melalui WhatsApp.",
      details: {
        logged: logSuccess,
        emailed: emailSuccess
      }
    };
  } catch (err) {
    console.error("Error in submitSpkluLead: " + err.message);
    return {
      success: false,
      message: "Terjadi kesalahan sistem: " + err.message
    };
  }
}

/**
 * Retrieves the passcode for SPKLU Business Proposal downloads.
 * Initializes a 'Settings' sheet inside the Leads Tracker spreadsheet with default code '135711' if not already present.
 * 
 * @return {string} Passcode string
 */
/**
 * Retrieves the contact settings (WhatsApp, Sales WhatsApp, Telephone) from the Settings sheet.
 * Self-healing: Appends default keys if the Settings sheet is missing them.
 * 
 * @return {Object} An object containing the settings values
 */
function getTcsContactSettings() {
  var settings = {
    SPKLU_PROPOSAL_PASSCODE: "135711",
    TCS_CONTACT_WHATSAPP: "628111460707",
    TCS_SALES_WHATSAPP: "628111978888",
    TCS_CONTACT_TELEPHONE: "021 - 2126 6084"
  };

  try {
    var ss = getTcsSpreadsheet();
    if (ss) {
      var sheet = ss.getSheetByName('Settings');
      if (!sheet) {
        // Initialize sheet if completely missing
        sheet = ss.insertSheet('Settings');
        sheet.appendRow(['Setting Name', 'Value', 'Description']);
        sheet.setFrozenRows(1);
        var headerRange = sheet.getRange(1, 1, 1, 3);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#0f172a');
        headerRange.setFontColor('#ffffff');
      }

      var data = sheet.getDataRange().getValues();
      var sheetKeys = {};
      for (var i = 1; i < data.length; i++) {
        if (data[i][0]) {
          sheetKeys[data[i][0]] = { value: String(data[i][1]).trim(), rowIndex: i + 1 };
        }
      }

      // Self-heal/ensure all default settings exist in the Sheet
      var defaults = [
        { key: 'SPKLU_PROPOSAL_PASSCODE', val: '135711', desc: 'Passcode for SPKLU Feasibility PDF Downloads (Editable)' },
        { key: 'TCS_CONTACT_WHATSAPP', val: '628111460707', desc: 'General TCS WhatsApp (digits only, e.g. 628111460707)' },
        { key: 'TCS_SALES_WHATSAPP', val: '628111978888', desc: 'TCS Sales WhatsApp for passcode requests (digits only, e.g. 628111978888)' },
        { key: 'TCS_CONTACT_TELEPHONE', val: '021 - 2126 6084', desc: 'TCS Office Telephone (e.g. 021 - 2126 6084)' }
      ];

      defaults.forEach(function(item) {
        if (sheetKeys.hasOwnProperty(item.key)) {
          settings[item.key] = sheetKeys[item.key].value;
        } else {
          sheet.appendRow([item.key, item.val, item.desc]);
          settings[item.key] = item.val;
        }
      });
    }
  } catch (err) {
    console.warn("getTcsContactSettings failed: " + err.message);
  }

  return settings;
}

/**
 * Retrieves the passcode for SPKLU Business Proposal downloads.
 * 
 * @return {string} Passcode string
 */
function getSpkluPasscode() {
  try {
    return getTcsContactSettings().SPKLU_PROPOSAL_PASSCODE;
  } catch (err) {
    console.warn("getSpkluPasscode failed: " + err.message);
    return "135711"; // Absolute fallback
  }
}

/**
 * Validates the user entered passcode against the Google Sheets settings record.
 * 
 * @param {string} userInput - The passcode input by the user
 * @return {boolean} True if matching, false otherwise
 */
function checkSpkluPasscode(userInput) {
  try {
    var correctPasscode = getSpkluPasscode();
    return String(userInput).trim() === correctPasscode;
  } catch (err) {
    console.error("checkSpkluPasscode error: " + err.message);
    return String(userInput).trim() === "135711"; // Local safe fallback
  }
}

/**
 * Handles incoming HTTP POST requests from static hosting environments (like Vercel).
 * Processes forms and checks passcodes cross-origin.
 * 
 * @param {Object} e - Event parameter containing the post body
 * @return {TextOutput} ContentService TextOutput formatted as JSON
 */
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    var data = postData.data;
    var responseData = { success: false, message: "Invalid API action" };
    
    if (action === "submitSpkluLead") {
      responseData = submitSpkluLead(data);
    } else if (action === "submitConsultation") {
      responseData = submitConsultation(data);
    } else if (action === "checkSpkluPasscode") {
      var isValid = checkSpkluPasscode(data.passcode);
      responseData = { success: true, valid: isValid };
    } else if (action === "getContactSettings") {
      responseData = { success: true, settings: getTcsContactSettings() };
    } else if (action === "callGeminiSecure") {
      responseData = callGeminiSecure(data.query);
    }
    
    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Memanggil Gemini 1.5 Flash API dengan aman dari sisi server Google Apps Script.
 * Membaca basis pengetahuan secara dinamis dari KnowledgeBase.html.
 * API Key disimpan secara terproteksi di Project Script Properties.
 * 
 * @param {string} query - Pertanyaan dari pengguna
 * @return {Object} Objek respon berisi status sukses dan teks balasan AI
 */
function callGeminiSecure(query) {
  try {
    var apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
    if (!apiKey) {
      return { 
        success: false, 
        error: "Google Gemini API Key belum dikonfigurasi di Script Properties. Silakan konfigurasi kunci GEMINI_API_KEY Anda di Settings Google Apps Script." 
      };
    }
    
    // Baca basis pengetahuan secara dinamis dari file HTML
    var knowledgeBase = "";
    try {
      knowledgeBase = HtmlService.createHtmlOutputFromFile('KnowledgeBase').getContent();
    } catch (e) {
      console.warn("Gagal memuat KnowledgeBase.html, menggunakan fallback: " + e.message);
      knowledgeBase = "Aturan Bisnis Kemitraan SPKLU PT TCS:\n" +
                      "- Opsi A: Bagi hasil bersih 35% Host (Investor), 65% PT TCS. Luas minimal 2 slot parkir. Kontrak 5+5 tahun.\n" +
                      "- Opsi B: Finansial Mandiri mulai Rp100 Juta. Autopilot diurus penuh PT TCS (SLO PLN, pemeliharaan, dll).";
    }
    
    var systemInstruction = 
      "Anda adalah \"TCS EV Consultant\", asisten virtual pintar dan profesional dari PT TCS.\n" +
      "Tugas utama Anda adalah mendampingi calon investor memahami peluang dan potensi bisnis kemitraan SPKLU PT TCS 2026.\n" +
      "Gunakan data resmi dari basis pengetahuan berikut untuk menjawab seluruh pertanyaan pengguna secara formal, optimis, ramah, persuasif, dan mendalam:\n\n" +
      knowledgeBase + "\n\n" +
      "Aturan Penting Perilaku Anda:\n" +
      "1. Gunakan bahasa Indonesia yang baik, santun, profesional, dan meyakinkan.\n" +
      "2. Jangan mengarang atau memanipulasi data di luar cakupan materi yang ada di basis pengetahuan di atas.\n" +
      "3. Jika ada pertanyaan mengenai analisis atau simulasi kelayakan finansial, tekankan PBP (Payback Period), NPV, dan IRR yang dinilai secara akuntansi hulu.\n" +
      "4. Tekankan pentingnya mengamankan kuota wilayah dan koordinat lokasi di sistem OSS PLN sekarang juga agar tidak terkunci oleh pihak lain karena kuota zonasi sangat terbatas.\n" +
      "5. Lakukan Consultative Selling: Di akhir setiap balasan Anda, ajukan satu pertanyaan penutup yang memancing keterlibatan calon investor (Call to Action), misalnya menanyakan ketersediaan lokasi strategis mereka, tipe kemitraan yang mereka minati (Opsi A atau Opsi B), atau mengajak mereka mengisi formulir pendaftaran kemitraan di halaman website.\n" +
      "6. Jawab secara rapi dengan memformat daftar menggunakan poin-poin sederhana. Hindari pemakaian formatting markdown yang terlalu berlebihan.";

    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
    
    var payload = {
      contents: [{ parts: [{ text: query }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    };
    
    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(url, options);
    var json = JSON.parse(response.getContentText());
    
    if (json.candidates && json.candidates[0].content.parts[0].text) {
      return { success: true, text: json.candidates[0].content.parts[0].text };
    } else {
      var errDetail = "Format respon AI tidak dikenal.";
      if (json.error && json.error.message) {
        errDetail = json.error.message;
      }
      return { success: false, error: "Gagal memproses respon dari Gemini API: " + errDetail };
    }
  } catch (err) {
    return { success: false, error: "Kesalahan server internal: " + err.message };
  }
}
