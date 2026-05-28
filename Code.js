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
  var page = e && e.parameter && e.parameter.page ? e.parameter.page : 'index';
  if (page.toLowerCase() === 'spklu') {
    return HtmlService.createTemplateFromFile('Spklu')
      .evaluate()
      .setTitle('Kemitraan SPKLU - PT. Titis Cahaya Sejahtera')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('PT. Titis Cahaya Sejahtera - MEP Contractor')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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
function getSpkluPasscode() {
  try {
    var ss = getTcsSpreadsheet();
    
    if (ss) {
      var sheet = ss.getSheetByName('Settings');
      if (!sheet) {
        sheet = ss.insertSheet('Settings');
        sheet.appendRow(['Setting Name', 'Value', 'Description']);
        sheet.appendRow(['SPKLU_PROPOSAL_PASSCODE', '135711', 'Passcode for SPKLU Feasibility PDF Downloads (Editable)']);
        
        // Style header row
        var headerRange = sheet.getRange(1, 1, 1, 3);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#0f172a');
        headerRange.setFontColor('#ffffff');
        sheet.setFrozenRows(1);
      }
      
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === 'SPKLU_PROPOSAL_PASSCODE') {
          return String(data[i][1]).trim();
        }
      }
    }
    return "135711"; // Fallback to default
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
    }
    
    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
