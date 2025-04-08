let button = document.getElementById("calculateBtn");
const slumpInput = document.getElementById('Slump');
const waterContentInput = document.getElementById('WaterContent');


document.addEventListener('DOMContentLoaded', () => {
  
  function toggleFields() {
      if (slumpInput.value.trim() !== '') {
          waterContentInput.disabled = true;
          waterContentInput.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
          waterContentInput.disabled = false;
          waterContentInput.classList.remove('opacity-50', 'cursor-not-allowed');
      }

      if (waterContentInput.value.trim() !== '') {
          slumpInput.disabled = true;
          slumpInput.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
          slumpInput.disabled = false;
          slumpInput.classList.remove('opacity-50', 'cursor-not-allowed');
      }
  }

  slumpInput.addEventListener('input', toggleFields);
  waterContentInput.addEventListener('input', toggleFields);
});




button.addEventListener("click", function () {
  // 💋 Helper function to fetch values and parse them easily
  // Makes code clean, reusable and avoids repetition—like learning where to touch you 😉
  const getVal = (id, parser = parseFloat) => parser(document.getElementById(id).value);

  // 🎯 Input Section – Grabbing user inputs from the form
  const gradeOfConcrete = getVal("GradeofConcrete", parseInt);
  const ExposureCondition = document.getElementById("ExposureCondition").value;
  const Slump = getVal("Slump", parseInt);
  const MaxCAggSize = getVal("MaximumSizeOfAggregate", parseInt);
  const AdmixtureDosage = getVal("AdmixtureDosage");
  const WaterReductionDueToAdmixture = getVal("WaterReductionDueToAdmixture", parseInt);
  const zone = getVal("FineAggregateZone", parseInt);
  const SGCement = getVal("SpecificGravityCement");
  const SGAdmixture = getVal("SpecificGravityAdmixture");
  const SGCA = getVal("SpecificGravityCourseAggregate");
  const SGFA = getVal("SpecificGravityFineAggregate");
  const WCRatio = getVal("WaterCementRatio");
  const SGWater = 1; // Standard specific gravity for water
  const volConcrete = 1; // Standard design volume (1 m³ of concrete)
  const waterContentInput = getVal("WaterContent", parseFloat); 
  console.log(waterContentInput)
  console.log(typeof(waterContentInput));
  

  

  // 💦 Function to determine volume ratio of fine/coarse aggregate based on IS Code
  const FAzone = (size, z) => {
    const zones = {
      10: [0.48, 0.5, 0.52, 0.54],
      20: [0.6, 0.62, 0.64, 0.66],
      40: [0.69, 0.71, 0.72, 0.73],
    };
    return zones[size]?.[z - 1] || 0;
  };

  // 💪 Calculate target mean strength (f’ck) using standard deviation or IS margin
  const targetMeanStrength = (grade) => {
    const stdDev = {10: 3.5, 20: 4.0, 30: 5.0, 40: 5.0, 50: 5.0, 60: 5.0, 65: 6.0, 75: 6.0};
    const margin = {10: 5.0, 20: 5.5, 30: 6.5, 40: 6.5, 50: 6.5, 60: 6.5, 65: 8.0, 75: 8.0};
    let s = stdDev[Math.floor(grade / 5) * 5] || 5.0;
    let x = margin[Math.floor(grade / 5) * 5] || 6.5;
    return Math.max(grade + 1.65 * s, grade + x);
  };

  // 🌊 Adjusted water content based on slump value and admixture reduction
  const waterContent = (slump, size) => {
    const base = {10: 208, 20: 186, 40: 165};
    let water = base[size] || 186;
    let delta = Math.abs(slump - 50);
    let correction = (delta / 25) * 3; // 3% increase/decrease per 25mm slump
    water += (slump > 50 ? correction : -correction) / 100 * water;
    return water * (1 - WaterReductionDueToAdmixture / 100);
  };

  // 🧱 Cement content calculated from W/C ratio with exposure condition minimums
  const cementContent = (water, ratio) => {
    const limits = {
      "Mild": 300,
      "Moderate": 300,
      "Severe": 320,
      "Very Severe": 340,
      "Extreme": 360,
    };
    const cement = water / ratio;
    const minCement = limits[ExposureCondition] || 300;
    if (cement < minCement) console.error("Cement < minimum content"); // Simple check for validation
    return cement;
  };

  // 🎈 Entrapped air value based on IS Code and size of aggregate
  const entrappedAir = (size) => ({10: 1.5, 20: 1.0, 40: 0.8})[size] || 1.0;

  // ⚖️ Aggregate volume ratio based on fine/coarse and W/C adjustments
  const volumeofCA_FA = (ratio) => {
    let adj = ((ratio - 0.5) / 0.05) * 0.01;
    let CA = Math.min(Math.max(adj + FAzone(MaxCAggSize, zone), 0), 1);
    return {
      coarseAggregate: CA,
      fineAggregate: +(1 - CA).toFixed(3),
    };
  };

  // 💡 Begin Calculations and Outputs
  const targetStrength = targetMeanStrength(gradeOfConcrete);
  document.getElementById("TargetStrength").innerText = targetStrength;

  const ActualwaterContent = waterContentInput ||  waterContent(Slump, MaxCAggSize);
  console.log(ActualwaterContent)
  const cement = cementContent(ActualwaterContent, WCRatio);
  const entraAir = entrappedAir(MaxCAggSize);
  const volRatio = volumeofCA_FA(WCRatio);

  // Volume contributions by individual materials
  const volCement = +(cement / (SGCement * 1000)).toFixed(4);
  const volWater = ActualwaterContent / (SGWater * 1000);
  const volAdmixture = +(((AdmixtureDosage / 100) * cement) / (SGAdmixture * 1000)).toFixed(4);
  const volEntrappedAir = entraAir / 100;

  // Total aggregate volume available after other volumes subtracted
  const volAllAgg = volConcrete - (volCement + volWater + volAdmixture + volEntrappedAir);

  // 🧡 Cement Output
  const cementDisplay = Math.round(cement);
  document.getElementById("cementOrange").innerText = cementDisplay;
  document.getElementById("Cement").innerText = cementDisplay;

  // 💚 Fine Aggregate Output
  const massFineAgg = volAllAgg * volRatio.fineAggregate * SGFA * 1000;
  document.getElementById("fineAggGreen").innerText = (massFineAgg / cementDisplay).toFixed(2);
  document.getElementById("FineAggregateOutputs").innerText = Math.floor(massFineAgg);

  // 💙 Coarse Aggregate Output
  const massCourseAgg = volAllAgg * volRatio.coarseAggregate * SGCA * 1000;
  document.getElementById("courseAggBlue").innerText = (massCourseAgg / cementDisplay).toFixed(2);
  document.getElementById("CourseAggregateOutput").innerText = Math.floor(massCourseAgg);

  // 💄 Admixture Output
  const massAdmixture = (AdmixtureDosage / 100) * cement;
  document.getElementById("AdmixtureMass").innerText = massAdmixture.toFixed(2);
  document.getElementById("waterConRed").innerText = WCRatio;

  // 💃 Show the results section
  document.getElementById("output").classList.remove("hidden");
});
