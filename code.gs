/**
 * 文字修復大作戰 - 後端核心程式 (Gemini 2.5 版)
 */
const SCRIPT_PROP = PropertiesService.getScriptProperties();
const API_KEY = SCRIPT_PROP.getProperty('GEMINI_API_KEY');

// 根據您的環境，更新為最新模型名稱
const MODEL_NAME = "gemini-2.5-flash"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('文字修復大作戰')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function generateAIReport(studentData) {
  if (!API_KEY) return "❌ 系統錯誤：未偵測到 API KEY，請檢查指令碼屬性。";

  const prompt = `
    你是一位專業且幽默的國文導師。請根據以下學生的表現生成「文字修復報告」：
    1. 學生姓名：${studentData.name}
    2. 第一關(字魔)：題目「${studentData.s1_text}」，學生修正為「${studentData.s1_ans1}」與「${studentData.s2_ans2}」。
    3. 第二關(成語)：題目「${studentData.s2_q}」，學生選擇「${studentData.s2_ans}」，結果：${studentData.s2_correct ? '正確' : '錯誤'}。
    4. 第三關(標點)：原文「${studentData.s3_text}」，提交了兩組斷句。
    
    【要求】：使用純文字排版邊框，給予酷炫稱號，點評標點符號的魔力，嚴禁圖片。
  `;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true // 開啟此項以抓取詳細錯誤訊息
  };

  try {
    const response = UrlFetchApp.fetch(API_URL, options);
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();
    const json = JSON.parse(responseText);

    if (statusCode === 200 && json.candidates && json.candidates[0].content) {
      return json.candidates[0].content.parts[0].text;
    } else {
      // 如果失敗，回傳具體的錯誤原因供除錯
      console.error("API Error: " + responseText);
      return `⚠️ 修復失敗 (代碼: ${statusCode})。原因：${json.error ? json.error.message : '模型名稱可能不正確或 Key 無效'}`;
    }
  } catch (e) {
    return "🌐 網路傳輸中斷，請檢查 API Key 是否正確設定。";
  }
}
