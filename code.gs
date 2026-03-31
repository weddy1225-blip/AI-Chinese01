const SCRIPT_PROP = PropertiesService.getScriptProperties();
const API_KEY = SCRIPT_PROP.getProperty('GEMINI_API_KEY');
const MODEL_NAME = "gemini-2.5-flash-lite"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('文字修復大作戰')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function generateAIReport(studentData) {
  if (!API_KEY) return "❌ 系統錯誤：未設定 API KEY。";

  const prompt = `
    你是一位專業的國文導師。請根據以下學生的遊戲表現生成「文字修復報告」：
    
    1. 學生姓名：${studentData.name}
    2. 第一關(字魔)：題目為「${studentData.s1_text}」，學生修正為「${studentData.s1_ans1}」與「${studentData.s2_ans2}」。
    3. 第二關(成語)：題目情境為「${studentData.s2_q}」，學生選擇「${studentData.s2_ans}」，判斷結果為：${studentData.s2_correct ? '正確' : '錯誤'}。
    4. 第三關(標點)：原文為「${studentData.s3_text}」，提交了兩種斷句。
    
    【格式要求】：
    - 使用純文字排版，製作精美的邊框。
    - 給予一個酷炫稱號。
    - 根據成語是否正確，給予鼓勵或建議。
    - 嚴禁生成圖片。
  `;

  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  const options = { method: "post", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true };

  try {
    const response = UrlFetchApp.fetch(API_URL, options);
    const json = JSON.parse(response.getContentText());
    return json.candidates[0].content.parts[0].text;
  } catch (e) {
    return "報告系統連線異常，但你完成挑戰了！稱號：文字探索者";
  }
}
