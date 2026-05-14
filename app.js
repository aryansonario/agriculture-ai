const FLASK_URL = "https://swapping-alto-unrest.ngrok-free.dev";
const FETCH_INTERVAL = 10000;

const BASE_TRANSLATIONS = {
  eyebrow: "AI Powered",
  title: "Smart Farm Advisor",
  live: "Live",
  todayLabel: "Today's Status",
  statusTitle: "Reading sensor data...",
  statusSub: "Your ESP32 sensor updates this automatically every 10 seconds.",
  sensorSectionLabel: "Sensor Snapshot",
  sensorSectionTitle: "Latest field readings",
  sMoisture: "Moisture",
  sTemp: "Temp",
  sHumidity: "Humidity",
  pumpLabel: "Water Pump",
  pumpOff: "OFF - Soil moisture is fine",
  pumpOn: "ON - Auto irrigation running",
  pumpToggle: "Force ON",
  forceOff: "Force OFF",
  cropLabel: "Crop Suggestion",
  cropTitle: "Analysing...",
  cropBody: "Waiting for Gemini AI response.",
  irrigLabel: "Irrigation Advice",
  waterTitle: "Analysing...",
  waterBody: "Waiting for Gemini AI response.",
  soilLabel: "Soil Health",
  soilTitle: "Analysing...",
  soilBody: "Waiting for Gemini AI response.",
  footer: "Smart Farm Advisor - Powered by Gemini AI - ESP32 Sensor",
  updated: "Last updated: ",
  noData: "No sensor data yet. Is the ESP32 connected?",
  plantSectionLabel: "Field Context",
  plantSectionTitle: "Tell us what is growing on this soil",
  plantSectionSub: "This is sent to Flask and included with the ESP32 data for Gemini.",
  plantTypeLabel: "What is currently grown?",
  plantNameLabel: "Crop or tree name",
  plantNameCrop: "Crop name",
  plantNameTree: "Tree name",
  plantTypeCrop: "Crop",
  plantTypeTree: "Tree",
  plantTypeNone: "Nothing grown",
  plantCropPlaceholder: "Example: wheat, rice, cotton",
  plantTreePlaceholder: "Example: mango, neem, coconut",
  plantSave: "Save field info",
  plantHint: "This helps Gemini tailor the advice to the current field.",
  plantSaving: "Saving field info...",
  plantSavedCrop: "Crop information saved.",
  plantSavedTree: "Tree information saved.",
  plantSavedNone: "Saved: nothing is currently grown on this soil.",
  plantRequired: "Please enter the crop or tree name.",
  plantError: "Could not save field info.",
  geminiLoadingTitle: "Sending sensor data to Gemini...",
  geminiLoadingBody: "Please wait while Gemini reviews the latest 1 to 40 sensor readings and prepares advice.",
  geminiError: "Could not get Gemini advice right now.",
  cropAdviceTitle: "Crop Advice",
  treeAdviceTitle: "Tree Advice",
  openFieldAdviceTitle: "Suggested Plants",
  irrigationAdviceTitle: "Irrigation Today",
  soilAdviceTitle: "Soil Condition",
  heroUrgentIcon: "!",
  heroUrgentTitle: "Field needs water now!",
  heroUrgentSub: "Soil moisture is very low at ${value}%. Pump has been activated.",
  heroLightIcon: "Water",
  heroLightTitle: "Light irrigation recommended",
  heroLightSub: "Moisture is ${value}%. Water for 15–20 minutes today.",
  heroGoodIcon: "OK",
  heroGoodTitle: "Field is in good condition",
  heroGoodSub: "Moisture is ${value}%. No irrigation needed today.",
  heroWetIcon: "Wet",
  heroWetTitle: "Soil is very moist",
  heroWetSub: "Moisture is ${value}%. Do not water. Check for waterlogging.",
  langEnglish: "English",
  langHindi: "Hindi",
  langMarathi: "Marathi"
};

const TRANSLATIONS = {
  en: { ...BASE_TRANSLATIONS },
  hi: {
    ...BASE_TRANSLATIONS,
    eyebrow: "एआई संचालित",
    title: "स्मार्ट फार्म सलाहकार",
    live: "लाइव",
    todayLabel: "आज की स्थिति",
    statusTitle: "सेंसर डेटा पढ़ा जा रहा है...",
    statusSub: "आपका ESP32 सेंसर हर 10 सेकंड में अपने आप अपडेट करता है।",
    sMoisture: "नमी",
    sTemp: "तापमान",
    sHumidity: "आर्द्रता",
    sPh: "मिट्टी pH",
    pumpLabel: "पानी पंप",
    pumpOff: "बंद - मिट्टी में नमी ठीक है",
    pumpOn: "चालू - स्वचालित सिंचाई चल रही है",
    pumpToggle: "जबरदस्ती चालू",
    forceOff: "जबरदस्ती बंद",
    cropLabel: "फसल सुझाव",
    cropTitle: "विश्लेषण हो रहा है...",
    cropBody: "Gemini AI के उत्तर का इंतजार है।",
    irrigLabel: "सिंचाई सलाह",
    waterTitle: "विश्लेषण हो रहा है...",
    waterBody: "Gemini AI के उत्तर का इंतजार है।",
    soilLabel: "मिट्टी स्वास्थ्य",
    soilTitle: "विश्लेषण हो रहा है...",
    soilBody: "Gemini AI के उत्तर का इंतजार है।",
    footer: "स्मार्ट फार्म सलाहकार - Gemini AI - ESP32 सेंसर",
    updated: "अंतिम अपडेट: ",
    noData: "अभी सेंसर डेटा नहीं है। क्या ESP32 जुड़ा है?",
    plantSectionLabel: "खेत की जानकारी",
    plantSectionTitle: "बताइए इस मिट्टी में क्या उगाया जा रहा है",
    plantSectionSub: "यह जानकारी Flask को भेजी जाएगी और ESP32 डेटा के साथ Gemini को दी जाएगी।",
    plantTypeLabel: "अभी क्या उगाया जा रहा है?",
    plantNameLabel: "फसल या पेड़ का नाम",
    plantNameCrop: "फसल का नाम",
    plantNameTree: "पेड़ का नाम",
    plantTypeCrop: "फसल",
    plantTypeTree: "पेड़",
    plantTypeNone: "कुछ नहीं उगाया",
    plantCropPlaceholder: "उदाहरण: गेहूं, धान, कपास",
    plantTreePlaceholder: "उदाहरण: आम, नीम, नारियल",
    plantSave: "जानकारी सहेजें",
    plantHint: "इससे Gemini खेत के हिसाब से सही सलाह देगा।",
    plantSaving: "जानकारी सहेजी जा रही है...",
    plantSavedCrop: "फसल की जानकारी सहेज ली गई।",
    plantSavedTree: "पेड़ की जानकारी सहेज ली गई।",
    plantSavedNone: "सहेजा गया: अभी इस मिट्टी में कुछ नहीं उगाया जा रहा है।",
    plantRequired: "कृपया फसल या पेड़ का नाम लिखें।",
    plantError: "जानकारी सहेजी नहीं जा सकी।",
    cropAdviceTitle: "फसल सलाह",
    treeAdviceTitle: "पेड़ सलाह",
    openFieldAdviceTitle: "उपयुक्त पौधे",
    irrigationAdviceTitle: "आज की सिंचाई",
    soilAdviceTitle: "मिट्टी की स्थिति",
    heroUrgentIcon: "सावधान",
    heroUrgentTitle: "खेत को अभी पानी चाहिए",
    heroUrgentSub: "मिट्टी की नमी ${value}% है। पंप चालू कर दिया गया है।",
    heroLightIcon: "पानी",
    heroLightTitle: "हल्की सिंचाई की सलाह",
    heroLightSub: "नमी ${value}% है। आज 15-20 मिनट पानी दें।",
    heroGoodIcon: "ठीक",
    heroGoodTitle: "खेत की स्थिति अच्छी है",
    heroGoodSub: "नमी ${value}% है। आज सिंचाई की जरूरत नहीं है।",
    heroWetIcon: "गीला",
    heroWetTitle: "मिट्टी बहुत गीली है",
    heroWetSub: "नमी ${value}% है। पानी न दें। जलभराव की जांच करें।",
    langEnglish: "अंग्रेज़ी",
    langHindi: "हिंदी",
    langMarathi: "मराठी"
  },
  mr: {
    ...BASE_TRANSLATIONS,
    eyebrow: "एआय आधारित",
    title: "स्मार्ट फार्म सल्लागार",
    live: "लाइव्ह",
    todayLabel: "आजची स्थिती",
    statusTitle: "सेन्सर डेटा वाचला जात आहे...",
    statusSub: "तुमचा ESP32 सेन्सर दर 10 सेकंदांनी आपोआप अपडेट होतो.",
    sMoisture: "ओलावा",
    sTemp: "तापमान",
    sHumidity: "आर्द्रता",
    sPh: "माती pH",
    pumpLabel: "पाण्याचा पंप",
    pumpOff: "बंद - मातीत ओलावा ठीक आहे",
    pumpOn: "चालू - स्वयंचलित सिंचन सुरू आहे",
    pumpToggle: "जबरदस्ती चालू",
    forceOff: "जबरदस्ती बंद",
    cropLabel: "पिक सल्ला",
    cropTitle: "विश्लेषण सुरू आहे...",
    cropBody: "Gemini AI च्या उत्तराची वाट पाहत आहोत.",
    irrigLabel: "सिंचन सल्ला",
    waterTitle: "विश्लेषण सुरू आहे...",
    waterBody: "Gemini AI च्या उत्तराची वाट पाहत आहोत.",
    soilLabel: "माती आरोग्य",
    soilTitle: "विश्लेषण सुरू आहे...",
    soilBody: "Gemini AI च्या उत्तराची वाट पाहत आहोत.",
    footer: "स्मार्ट फार्म सल्लागार - Gemini AI - ESP32 सेन्सर",
    updated: "शेवटचे अपडेट: ",
    noData: "अजून सेन्सर डेटा नाही. ESP32 जोडले आहे का?",
    plantSectionLabel: "शेतीची माहिती",
    plantSectionTitle: "या मातीत काय लावले आहे ते सांगा",
    plantSectionSub: "ही माहिती Flask कडे जाईल आणि ESP32 डेटासोबत Gemini ला पाठवली जाईल.",
    plantTypeLabel: "सध्या काय लावले आहे?",
    plantNameLabel: "पिक किंवा झाडाचे नाव",
    plantNameCrop: "पिकाचे नाव",
    plantNameTree: "झाडाचे नाव",
    plantTypeCrop: "पिक",
    plantTypeTree: "झाड",
    plantTypeNone: "काहीही लावले नाही",
    plantCropPlaceholder: "उदाहरण: गहू, तांदूळ, कापूस",
    plantTreePlaceholder: "उदाहरण: आंबा, कडुलिंब, नारळ",
    plantSave: "माहिती जतन करा",
    plantHint: "यामुळे Gemini ला शेतानुसार योग्य सल्ला देता येईल.",
    plantSaving: "माहिती जतन केली जात आहे...",
    plantSavedCrop: "पिकाची माहिती जतन केली.",
    plantSavedTree: "झाडाची माहिती जतन केली.",
    plantSavedNone: "जतन केले: सध्या या मातीत काहीही लावलेले नाही.",
    plantRequired: "कृपया पिक किंवा झाडाचे नाव टाका.",
    plantError: "माहिती जतन करता आली नाही.",
    cropAdviceTitle: "पिक सल्ला",
    treeAdviceTitle: "झाड सल्ला",
    openFieldAdviceTitle: "योग्य वनस्पती",
    irrigationAdviceTitle: "आजचे सिंचन",
    soilAdviceTitle: "मातीची स्थिती",
    heroUrgentIcon: "धोका",
    heroUrgentTitle: "शेताला आत्ताच पाणी हवे",
    heroUrgentSub: "मातीतील ओलावा ${value}% आहे. पंप सुरू केला आहे.",
    heroLightIcon: "पाणी",
    heroLightTitle: "हलके सिंचन सुचवले आहे",
    heroLightSub: "ओलावा ${value}% आहे. आज 15-20 मिनिटे पाणी द्या.",
    heroGoodIcon: "ठीक",
    heroGoodTitle: "शेताची स्थिती चांगली आहे",
    heroGoodSub: "ओलावा ${value}% आहे. आज सिंचनाची गरज नाही.",
    heroWetIcon: "ओले",
    heroWetTitle: "माती खूप ओली आहे",
    heroWetSub: "ओलावा ${value}% आहे. पाणी देऊ नका. पाणी साचले आहे का ते तपासा.",
    langEnglish: "इंग्रजी",
    langHindi: "हिंदी",
    langMarathi: "मराठी"
  }
};

let currentLang = "en";
let currentLatestData = null;
let currentAdvice = null;
let isPlantFormDirty = false;
let latestAdviceSignature = null;
let pendingAdviceSignature = null;
let latestAdviceRequestId = 0;

const els = {
  moistureVal: document.getElementById("moistureVal"),
  tempVal: document.getElementById("tempVal"),
  humidityVal: document.getElementById("humidityVal"),
  heroTitle: document.getElementById("heroTitle"),
  heroSub: document.getElementById("heroSub"),
  heroIcon: document.getElementById("heroIcon"),
  cropTitle: document.getElementById("cropTitle"),
  cropBody: document.getElementById("cropBody"),
  waterTitle: document.getElementById("waterTitle"),
  waterBody: document.getElementById("waterBody"),
  soilTitle: document.getElementById("soilTitle"),
  soilBody: document.getElementById("soilBody"),
  pumpBar: document.getElementById("pumpBar"),
  pumpStatus: document.getElementById("pumpStatus"),
  pumpToggleBtn: document.getElementById("pumpToggleBtn"),
  lastUpdated: document.getElementById("lastUpdated"),
  loadingBar: document.getElementById("loadingBar"),
  loadingFill: document.querySelector(".loading-fill"),
  loadingScreen: document.getElementById("loadingScreen"),
  loadingScreenTitle: document.getElementById("loadingScreenTitle"),
  loadingScreenText: document.getElementById("loadingScreenText"),
  langSelect: document.getElementById("languageSelect"),
  plantForm: document.getElementById("plantForm"),
  plantTypeSelect: document.getElementById("plantTypeSelect"),
  plantTypeCropOption: document.getElementById("plantTypeCropOption"),
  plantTypeTreeOption: document.getElementById("plantTypeTreeOption"),
  plantTypeNoneOption: document.getElementById("plantTypeNoneOption"),
  plantNameInput: document.getElementById("plantNameInput"),
  plantNameLabel: document.getElementById("plantNameLabel"),
  plantSubmitBtn: document.getElementById("plantSubmitBtn"),
  plantStatusText: document.getElementById("plantStatusText"),
  languageOptions: document.querySelectorAll("#languageSelect option")
};

function t() {
  return TRANSLATIONS[currentLang] || TRANSLATIONS.en;
}

function showLoading() {
  els.loadingBar.classList.add("active");
  els.loadingFill.style.width = "0%";
  setTimeout(() => {
    els.loadingFill.style.width = "80%";
  }, 50);
}

function hideLoading() {
  els.loadingFill.style.width = "100%";
  setTimeout(() => {
    els.loadingBar.classList.remove("active");
    els.loadingFill.style.width = "0%";
  }, 400);
}

function showGeminiLoading() {
  const strings = t();
  els.loadingScreenTitle.textContent = strings.geminiLoadingTitle;
  els.loadingScreenText.textContent = strings.geminiLoadingBody;
  els.loadingScreen.classList.add("active");
  els.loadingScreen.setAttribute("aria-hidden", "false");
}

function hideGeminiLoading() {
  els.loadingScreen.classList.remove("active");
  els.loadingScreen.setAttribute("aria-hidden", "true");
}

function setPlantStatus(message, isError = false) {
  els.plantStatusText.textContent = message;
  els.plantStatusText.classList.toggle("error", isError);
}

function setPlantFieldMode(plantType, preserveValue = true) {
  const strings = t();
  const selectedType = plantType || "none";
  const isNothing = selectedType === "none";

  els.plantNameInput.disabled = isNothing;

  if (selectedType === "tree") {
    els.plantNameLabel.textContent = strings.plantNameTree;
    els.plantNameInput.placeholder = strings.plantTreePlaceholder;
  } else {
    els.plantNameLabel.textContent = strings.plantNameCrop;
    els.plantNameInput.placeholder = strings.plantCropPlaceholder;
  }

  if (!preserveValue && isNothing) {
    els.plantNameInput.value = "";
  }
}

function syncPlantFormFromData(data, force = false) {
  if (!data || (isPlantFormDirty && !force)) {
    return;
  }

  const plantType = data.plant_type || "none";
  const plantName = data.plant_name || "";

  els.plantTypeSelect.value = plantType;
  setPlantFieldMode(plantType, true);
  els.plantNameInput.value = plantName;
  isPlantFormDirty = false;
}

function updateSensorDisplay(data) {
  els.moistureVal.textContent = data.moisture !== null && data.moisture !== undefined
    ? `${Number(data.moisture).toFixed(1)}%`
    : "--%";
  els.tempVal.textContent = data.temperature !== null && data.temperature !== undefined
    ? `${Number(data.temperature).toFixed(1)} C`
    : "-- C";
  els.humidityVal.textContent = data.humidity !== null && data.humidity !== undefined
    ? `${Number(data.humidity).toFixed(1)}%`
    : "--%";
}

function updateAICards(data) {
  const strings = t();
  const advice = currentAdvice;
  const plantType = (data && data.plant_type) || "none";

  if (plantType === "tree") {
    els.cropTitle.textContent = strings.treeAdviceTitle;
  } else if (plantType === "crop") {
    els.cropTitle.textContent = strings.cropAdviceTitle;
  } else {
    els.cropTitle.textContent = strings.openFieldAdviceTitle;
  }

  els.cropBody.textContent = advice?.crop_suggestion || strings.cropBody;
  els.waterTitle.textContent = strings.irrigationAdviceTitle;
  els.waterBody.textContent = advice?.irrigation_advice || strings.waterBody;
  els.soilTitle.textContent = strings.soilAdviceTitle;
  els.soilBody.textContent = advice?.soil_health || strings.soilBody;
}

function updatePumpStatus(status) {
  const isOn = status === "ON";
  const strings = t();

  els.pumpBar.classList.toggle("pump-on", isOn);
  els.pumpStatus.textContent = isOn ? strings.pumpOn : strings.pumpOff;
  els.pumpToggleBtn.textContent = isOn ? strings.forceOff : strings.pumpToggle;
  els.pumpToggleBtn.classList.toggle("active", isOn);
}

function updateHeroCard(data) {
  const strings = t();
  if (!data || data.moisture === null || data.moisture === undefined) {
    els.heroIcon.textContent = "OK";
    els.heroTitle.textContent = strings.statusTitle;
    els.heroSub.textContent = strings.statusSub;
    return;
  }

  const moisture = Number(data.moisture);
  if (Number.isNaN(moisture)) {
    return;
  }

  if (moisture < 30) {
    els.heroIcon.textContent = strings.heroUrgentIcon || "!";
    els.heroTitle.textContent = strings.heroUrgentTitle || "Field needs water now!";
    els.heroSub.textContent = (strings.heroUrgentSub || "Soil moisture is very low at ${value}%. Pump has been activated.")
      .replace("${value}", moisture.toFixed(1));
  } else if (moisture < 50) {
    els.heroIcon.textContent = strings.heroLightIcon || "Water";
    els.heroTitle.textContent = strings.heroLightTitle || "Light irrigation recommended";
    els.heroSub.textContent = (strings.heroLightSub || "Moisture is ${value}%. Water for 15-20 minutes today.")
      .replace("${value}", moisture.toFixed(1));
  } else if (moisture < 75) {
    els.heroIcon.textContent = strings.heroGoodIcon || "OK";
    els.heroTitle.textContent = strings.heroGoodTitle || "Field is in good condition";
    els.heroSub.textContent = (strings.heroGoodSub || "Moisture is ${value}%. No irrigation needed today.")
      .replace("${value}", moisture.toFixed(1));
  } else {
    els.heroIcon.textContent = strings.heroWetIcon || "Wet";
    els.heroTitle.textContent = strings.heroWetTitle || "Soil is very moist";
    els.heroSub.textContent = (strings.heroWetSub || "Moisture is ${value}%. Do not water. Check for waterlogging.")
      .replace("${value}", moisture.toFixed(1));
  }
}

function updateTimestamp(timestamp) {
  const strings = t();

  if (!timestamp) {
    els.lastUpdated.textContent = `${strings.updated}--`;
    return;
  }

  const parsed = new Date(timestamp.replace(" ", "T"));
  const displayTime = Number.isNaN(parsed.getTime())
    ? timestamp
    : parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  els.lastUpdated.textContent = strings.updated + displayTime;
}

function getAdviceSignature(data) {
  if (!data || !data.sensor_id) {
    return null;
  }

  return `${data.sensor_id}|${data.plant_type || "none"}|${data.plant_name || ""}`;
}

function renderDashboard(data, options = {}) {
  currentLatestData = data;
  updateSensorDisplay(data);
  updateAICards(data);
  updatePumpStatus(data.pump_status);
  updateHeroCard(data);
  updateTimestamp(data.timestamp);
  syncPlantFormFromData(data, Boolean(options.forcePlantSync));
}

async function fetchLatestAdvice(data) {
  const signature = getAdviceSignature(data);
  if (!signature) {
    currentAdvice = null;
    latestAdviceSignature = null;
    pendingAdviceSignature = null;
    updateAICards(data);
    return;
  }

  const requestId = ++latestAdviceRequestId;
  currentAdvice = null;
  pendingAdviceSignature = signature;
  updateAICards(data);
  showGeminiLoading();

  try {
    const response = await fetch(`${FLASK_URL}/api/advice/latest`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || t().geminiError);
    }

    if (requestId !== latestAdviceRequestId) {
      return;
    }

    currentAdvice = result;
    latestAdviceSignature = signature;
    updateAICards(currentLatestData || data);
  } catch (error) {
    console.error("Could not fetch Gemini advice:", error);

    if (requestId !== latestAdviceRequestId) {
      return;
    }

    currentAdvice = {
      crop_suggestion: error.message || t().geminiError,
      irrigation_advice: error.message || t().geminiError,
      soil_health: error.message || t().geminiError
    };
    latestAdviceSignature = null;
    updateAICards(currentLatestData || data);
  } finally {
    if (requestId === latestAdviceRequestId) {
      pendingAdviceSignature = null;
      hideGeminiLoading();
    }
  }
}

async function fetchLatestData() {
  const hadDataBeforeFetch = Boolean(currentLatestData);
  showLoading();

  try {
    const response = await fetch(`${FLASK_URL}/api/latest`);
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    renderDashboard(data);

    if (!hadDataBeforeFetch) {
      setPlantStatus(t().plantHint);
    }

    const adviceSignature = getAdviceSignature(data);
    if (adviceSignature && adviceSignature !== latestAdviceSignature && adviceSignature !== pendingAdviceSignature) {
      await fetchLatestAdvice(data);
    } else if (!adviceSignature) {
      currentAdvice = null;
      latestAdviceSignature = null;
      updateAICards(data);
    }
  } catch (error) {
    console.error("Could not fetch data from Flask:", error);
    els.heroTitle.textContent = t().noData;
    els.heroSub.textContent = `Error: ${error.message}`;
    currentAdvice = null;
    latestAdviceSignature = null;
    hideGeminiLoading();
  }

  hideLoading();
}

async function saveFieldContext(event) {
  event.preventDefault();

  const strings = t();
  const plantType = els.plantTypeSelect.value;
  const plantName = els.plantNameInput.value.trim();

  if (plantType !== "none" && !plantName) {
    setPlantStatus(strings.plantRequired, true);
    return;
  }

  setPlantStatus(strings.plantSaving);
  els.plantSubmitBtn.disabled = true;

  try {
    const response = await fetch(`${FLASK_URL}/api/farm-context`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plant_type: plantType,
        plant_name: plantName
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || strings.plantError);
    }

    isPlantFormDirty = false;

    if (result.latest_data) {
      renderDashboard(result.latest_data, { forcePlantSync: true });
      await fetchLatestAdvice(result.latest_data);
    } else {
      syncPlantFormFromData(result, true);
      currentAdvice = null;
      latestAdviceSignature = null;
      updateAICards(currentLatestData);
    }

    if (plantType === "crop") {
      setPlantStatus(strings.plantSavedCrop);
    } else if (plantType === "tree") {
      setPlantStatus(strings.plantSavedTree);
    } else {
      setPlantStatus(strings.plantSavedNone);
    }
  } catch (error) {
    console.error("Could not save field info:", error);
    setPlantStatus(error.message || strings.plantError, true);
  } finally {
    els.plantSubmitBtn.disabled = false;
  }
}

els.pumpToggleBtn.addEventListener("click", async () => {
  const isCurrentlyOn = els.pumpToggleBtn.classList.contains("active");
  const newState = isCurrentlyOn ? "OFF" : "ON";

  try {
    await fetch(`${FLASK_URL}/api/pump`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pump_command: newState })
    });

    updatePumpStatus(newState);
    if (currentLatestData) {
      currentLatestData.pump_status = newState;
    }
  } catch (error) {
    console.error("Could not toggle pump:", error);
  }
});

els.langSelect.addEventListener("change", (event) => {
  currentLang = event.target.value;
  applyLanguage(currentLang);
});

els.plantForm.addEventListener("submit", saveFieldContext);
els.plantTypeSelect.addEventListener("change", () => {
  isPlantFormDirty = true;
  setPlantFieldMode(els.plantTypeSelect.value, false);
});
els.plantNameInput.addEventListener("input", () => {
  isPlantFormDirty = true;
});

function applyLanguage(lang) {
  const strings = TRANSLATIONS[lang] || TRANSLATIONS.en;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (strings[key]) {
      element.textContent = strings[key];
    }
  });

  els.plantTypeCropOption.textContent = strings.plantTypeCrop;
  els.plantTypeTreeOption.textContent = strings.plantTypeTree;
  els.plantTypeNoneOption.textContent = strings.plantTypeNone;
  if (els.languageOptions.length >= 3) {
    els.languageOptions[0].textContent = strings.langEnglish || "English";
    els.languageOptions[1].textContent = strings.langHindi || "Hindi";
    els.languageOptions[2].textContent = strings.langMarathi || "Marathi";
  }
  setPlantFieldMode(els.plantTypeSelect.value, true);

  if (currentLatestData) {
    renderDashboard(currentLatestData, { forcePlantSync: false });
  } else {
    currentAdvice = null;
    updatePumpStatus("OFF");
    updateTimestamp();
    updateAICards({ plant_type: els.plantTypeSelect.value || "none" });
    setPlantStatus(strings.plantHint);
  }

  if (els.loadingScreen.classList.contains("active")) {
    els.loadingScreenTitle.textContent = strings.geminiLoadingTitle;
    els.loadingScreenText.textContent = strings.geminiLoadingBody;
  }
}

applyLanguage(currentLang);
syncPlantFormFromData({ plant_type: "none", plant_name: "" }, true);
fetchLatestData();
setInterval(fetchLatestData, FETCH_INTERVAL);
