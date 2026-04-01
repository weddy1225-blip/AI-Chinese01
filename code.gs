const SCRIPT_PROP = PropertiesService.getScriptProperties();
const API_KEY = SCRIPT_PROP.getProperty('GEMINI_API_KEY');
const MODEL_NAME = "gemini-2.5-flash"; // 建議使用最新的穩定版本
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

/**
 * 處理網頁啟動
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('文字修復大作戰')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 接收前端數據並呼叫 AI 生成報告
 * @param {Object} studentData 包含姓名、各關卡題目與回答的物件
 */
function generateAIReport(studentData) {
  if (!API_KEY) return "❌ 系統錯誤：未設定 API KEY。";

  // 動態組合 Prompt，將玩家姓名帶入標題中
  const prompt = `
你是專業的國文導師。請根據以下學生的遊戲表現生成一份「${studentData.name} 的修復掃描報告」：

1. 學生姓名：${studentData.name}
2. 第一關(字魔)：題目為「${studentData.s1_text}」，學生修正為「${studentData.s1_ans1}」與「${studentData.s1_ans2}」。
3. 第二關(成語)：題目情境為「${studentData.s2_q}」，學生選擇「${studentData.s2_ans}」，判斷結果為：${studentData.s2_correct ? '正確' : '錯誤'}。
4. 第三關(標點)：原文為「${studentData.s3_text}」，學生提交了斷句嘗試。

【格式要求】：
- 報告開頭必須是大標題：「${studentData.name} 的修復掃描報告」。
- 使用純文字排版，利用符號（如：★, ══, 📋）製作精美的邊框感。
- 給予學生一個酷炫的稱號（例如：時空修復大師、文字守護者）。
- 針對學生的成語與錯別字表現，給予具體的鼓勵或專業的學習建議。
- 嚴禁生成任何圖片或 Markdown 以外的特殊代碼。
`;

  const payload = {
    contents: [{
      parts: [{ text: prompt }]
    }]
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(API_URL, options);
    const json = JSON.parse(response.getContentText());
    
    // 檢查回傳結構是否存在
    if (json.candidates && json.candidates[0].content.parts[0].text) {
      return json.candidates[0].content.parts[0].text;
    } else {
      return "報告生成失敗，請檢查 API 回傳內容。";
    }
    
  } catch (e) {
    return `報告系統連線異常，但你已完成挑戰！稱號：文字探索者 (錯誤代碼: ${e.message})`;
  }
}
