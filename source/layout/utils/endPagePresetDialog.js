/*

---------------------------------------------------------------
> 🪟 UI dialogs
---------------------------------------------------------------

*/

//  linter settings:
//  jshint -W061
//  jshint -W043

// end page presets UI...
function endPagePresetDialog() {
  var presetPath = scriptPreferencesPath + '/templates/ON-AIR/end page/end page presets';// → '~/AppData/Roaming/PROMO GNEWS script/templates'
  var presetFolder = new Folder(presetPath);

  if (!presetFolder.exists) {
    presetFolder.create();
  }
  // all control effects as object...
  var obj = defaultEndPageObj(buildFxObj()); // adds a default data value if needed...

  function updateObjLayers() {
    try {
      var aItem = app.project.activeItem; // current selected project item...

      obj.servico_end_page.titulo = textContent(aItem.layer('txt_titulo')); // layer 'txt_titulo' text content...
      obj.servico_end_page.subtitulo = textContent(aItem.layer('txt_subtitulo')); // layer 'txt_subtitulo' text content...

      try {
        var patComp = aItem.layer('comp_pattern').source; // pattern precomp layer...

        // get the first enabled layer...
        for (var l = 1; l <= patComp.numLayers; l++) {
          if (patComp.layer(l).enabled) {
            obj.layout_end_page.pattern_layer = patComp.layer(l).name; // first enabled layer → pattern layer name...
            break;
          }
        }
      } catch (error) { }
      try {
        var fotoComp = aItem.layer('comp_img apresentador').source; // host image precomp layer...

        // get the first enabled layer...
        for (var f = 1; f <= fotoComp.numLayers; f++) {
          if (fotoComp.layer(f).name.match(/adj_/)) continue; // ignore adjustment layers...

          if (fotoComp.layer(f).enabled) {
            obj.layout_end_page.foto_layer = fotoComp.layer(f).name; // first enabled layer → photo layer name...
            break;
          }
        }
      } catch (error) { }
    } catch (error) { }
  }

  // get preset file names..
  function getPresetNames() {
    presetDrop.removeAll();

    var filesArray = presetFolder.getFiles();
    var presetArray = ['new end page preset'];

    for (var f = 0; f < filesArray.length; f++) {
      var fileName = deleteFileExt(filesArray[f].displayName);
      presetArray.push(fileName);
    }
    populateDropdownList(presetArray, presetDrop);
    presetDrop.selection = 0;

    return presetArray;
  }

  function getLayers(compName, dropdown) {
    dropdown.removeAll();

    var layersArray = ['-------'];

    try {
      var aItem = app.project.activeItem;
      var comp = aItem.layer(compName).source;

      for (var l = 1; l <= comp.numLayers; l++) {
        var layerName = comp.layer(l).name;

        if (layerName.match(/adj_/)) continue;
        layersArray.push(layerName);
      }
      populateDropdownList(layersArray, dropdown);
    } catch (error) { }

    return layersArray;
  }

  // enable selected layer...
  function uiToComp_updateLayers(compName, dropdown) {
    var selectedName = dropdown.selection;
    var selectedLayerName = '-------';

    try {
      var aItem = app.project.activeItem;
      var patComp = aItem.layer(compName).source;

      for (var l = 1; l <= patComp.numLayers; l++) {
        var layerName = patComp.layer(l).name;

        if (layerName.match(/adj_/)) continue; // → ignore adjustment layers...
        patComp.layer(l).enabled = false;

        if (layerName.match(selectedName)) {
          patComp.layer(l).enabled = true; // → enabled layer...
          selectedLayerName = selectedName;
        }
      }
    } catch (error) { }
    return selectedLayerName;
  }

  // update current first enabled layer as index...
  function compToUi_updateLayers() {
    var pattern = obj.layout_end_page.pattern_layer;
    var foto = obj.layout_end_page.foto_layer;
    var patternArray = getLayers('comp_pattern', pattern_layoutDrop);
    var p = patternArray.indexOf(pattern);

    if (p >= 0) {
      pattern_layoutDrop.selection = p; // → pattern index
    }
    var fotoArray = getLayers('comp_img apresentador', foto_layoutDrop);
    var f = fotoArray.indexOf(foto);
    if (f >= 0) {
      foto_layoutDrop.selection = f; // → photo index
    }
  }

  // update window ui controls..
  function compToUi_updateUi() {
    compToUi_updateLayers();

    modelo_layoutDrop.selection = obj.layout_end_page.modelo - 1;
    subtitulo_layout.value = obj.layout_end_page.subtitulo;
    footage_layout.value = obj.layout_end_page.footage;
    foto_layout.value = obj.layout_end_page.foto;
    foto_layoutDrop.enabled = obj.layout_end_page.foto;
    pattern_layout.value = obj.layout_end_page.pattern;
    pattern_layoutDrop.enabled = obj.layout_end_page.pattern;

    titulo_servico.text = obj.servico_end_page.titulo;
    subtitulo_servico.text = obj.servico_end_page.subtitulo;
    subtitulo_servico.enabled = obj.layout_end_page.subtitulo;
    hora_servico.text = obj.servico_end_page.hora;
    min_servico.text = obj.servico_end_page.min;
    dia_servico.text = obj.servico_end_page.dia;
    livre_servico.text = 'DIGITE O TEXTO';
    formato_servicoDrop.selection = obj.servico_end_page.formato - 1;
    mes_servicoDrop.selection = obj.servico_end_page.mes - 1;
    semana_servicoDrop.selection = obj.servico_end_page.semana - 1;

    tema_aparenciaDrop.selection = obj.aparencia_end_page.tema - 1;

    compToUi_colors();
    updateServicoUiVis();
  }

  function uiToComp_updateCompFx() {
    try {
      var aItem = app.project.activeItem;
      var layoutFx = aItem.layer('ctrl_comp')
        .property('ADBE Effect Parade')
        .property('layout end page');
      layoutFx.property('subtitulo')
        .setValue(obj.layout_end_page.subtitulo);
      layoutFx.property('foto')
        .setValue(obj.layout_end_page.foto);
      layoutFx.property('footage')
        .setValue(obj.layout_end_page.footage);
      layoutFx.property('pattern')
        .setValue(obj.layout_end_page.pattern);
    } catch (error) { }
  }

  function updateServicoUiVis() {
    var i = formato_servicoDrop.selection.index;

    livre_servico.visible = false;
    semana_servicoDrop.visible = false;
    mes_servicoDrop.visible = false;
    servicoGrp2.visible = false;

    dia_servicoGrp.enabled = false;
    hora_servicoGrp.enabled = false;
    min_servicoGrp.enabled = false;

    if (i == 0) {
      livre_servico.visible = true;
    }
    if (i == 1) {
      semana_servicoDrop.visible = false;
      mes_servicoDrop.visible = true;

      servicoGrp2.visible = true;
      dia_servicoGrp.enabled = true;
      hora_servicoGrp.enabled = true;
      min_servicoGrp.enabled = true;
    }
    if (i == 2) {
      semana_servicoDrop.visible = false;

      servicoGrp2.visible = true;
      dia_servicoGrp.enabled = true;
      hora_servicoGrp.enabled = true;
      min_servicoGrp.enabled = true;
    }
    if (i == 3 || i == 5) {
      semana_servicoDrop.visible = true;

      servicoGrp2.visible = true;
      dia_servicoGrp.enabled = false;
      hora_servicoGrp.enabled = true;
      min_servicoGrp.enabled = true;
    }
    if (i == 4) {
      servicoGrp2.visible = true;
      hora_servicoGrp.enabled = true;
      min_servicoGrp.enabled = true;
    }
    if (i == 6) {
      mes_servicoDrop.visible = true;
    }
  }

  function uiToComp_colors() {
    try {
      var aItem = app.project.activeItem;
      var aparenciaFx = aItem.layer('ctrl_comp')
        .property('ADBE Effect Parade')
        .property('aparencia end page');
      aparenciaFx.property('logo')
        .setValue(hexToRGB(obj.aparencia_end_page.logo));
      aparenciaFx.property('titulo')
        .setValue(hexToRGB(obj.aparencia_end_page.titulo));
      aparenciaFx.property('subtitulo')
        .setValue(hexToRGB(obj.aparencia_end_page.subtitulo));
      aparenciaFx.property('apoio')
        .setValue(hexToRGB(obj.aparencia_end_page.apoio));
      aparenciaFx.property('horario')
        .setValue(hexToRGB(obj.aparencia_end_page.horario));
      aparenciaFx.property('horario base')
        .setValue(hexToRGB(obj.aparencia_end_page.horario_base));
      aparenciaFx.property('footage')
        .setValue(hexToRGB(obj.aparencia_end_page.footage));
      aparenciaFx.property('pattern')
        .setValue(hexToRGB(obj.aparencia_end_page.pattern));
      aparenciaFx.property('fundo')
        .setValue(hexToRGB(obj.aparencia_end_page.fundo));
    } catch (error) { }
  }

  function compToUi_colors() {
    setTxtColor(logo_aparencia, hexToRGB(obj.aparencia_end_page.logo));
    logo_aparencia.text = obj.aparencia_end_page.logo;
    setTxtColor(titulo_aparencia, hexToRGB(obj.aparencia_end_page.titulo));
    titulo_aparencia.text = obj.aparencia_end_page.titulo;
    setTxtColor(subtitulo_aparencia, hexToRGB(obj.aparencia_end_page.subtitulo));
    subtitulo_aparencia.text = obj.aparencia_end_page.subtitulo;
    setTxtColor(apoio_aparencia, hexToRGB(obj.aparencia_end_page.apoio));
    apoio_aparencia.text = obj.aparencia_end_page.apoio;
    setTxtColor(horario_aparencia, hexToRGB(obj.aparencia_end_page.horario));
    horario_aparencia.text = obj.aparencia_end_page.horario;
    setTxtColor(horario_base_aparencia, hexToRGB(obj.aparencia_end_page.horario_base));
    horario_base_aparencia.text = obj.aparencia_end_page.horario_base;
    setTxtColor(footage_aparencia, hexToRGB(obj.aparencia_end_page.footage));
    footage_aparencia.text = obj.aparencia_end_page.footage;
    setTxtColor(pattern_aparencia, hexToRGB(obj.aparencia_end_page.pattern));
    pattern_aparencia.text = obj.aparencia_end_page.pattern;
    setTxtColor(fundo_aparencia, hexToRGB(obj.aparencia_end_page.fundo));
    fundo_aparencia.text = obj.aparencia_end_page.fundo;
  }

  // set layout property value...
  function uiToComp_layoutFxValue(thisObj, property) {
    var aItem = app.project.activeItem;
    var val = thisObj.value;
    var subtituloFx = aItem.layer('ctrl_comp')
      .property('ADBE Effect Parade')
      .property('layout end page')
      .property(property)
      .setValue(val);
    obj.layout_end_page[property] = val;

    return val;
  }

  // set dropdown property index...
  function uiToComp_setDropDownIndex(dropDown, category, property) {
    var aItem = app.project.activeItem;
    var i = dropDown.selection.index + 1;
    aItem.layer('ctrl_comp')
      .property('ADBE Effect Parade')
      .property(category + ' end page')
      .property(property)
      .setValue(i);

    obj[category + '_end_page'][property] = i;

    return i;
  }

  var wPreset = new Window('palette', 'end page preset...');
  var preset_mainGrp = wPreset.add('group');
  preset_mainGrp.orientation = 'column';
  var presetDrop = preset_mainGrp.add('dropdownlist', [0, 0, 180, 10], []);
  var radGrp = preset_mainGrp.add('group');
  var expRad01 = radGrp.add('radiobutton', undefined, 'simple ui');
  expRad01.value = true;
  expRad01.helpTip = 'only presets';
  var expRad02 = radGrp.add('radiobutton', undefined, 'extended ui');
  expRad02.helpTip = 'full editor';

  //---------------------------------------------------------

  divider = wPreset.add('panel');
  divider.alignment = 'fill';

  var layout_mainGrp = wPreset.add('group');
  layout_mainGrp.orientation = 'column';
  layout_mainGrp.alignChildren = 'left';
  layout_mainGrp.visible = false;
  layout_mainGrp.spacing = 8;
  var layoutTxt = layout_mainGrp.add('statictext', undefined, 'layout:');
  setTxtColor(layoutTxt, sTxtColor);

  var modelArray = [
    'livre',
    'programa',
    'jornal'
  ];
  var modelo_layoutDrop = layout_mainGrp.add('dropdownlist', [0, 0, 180, 10], modelArray);

  var layoutGrp = layout_mainGrp.add('group');
  layoutGrp.orientation = 'stack';
  layoutGrp.alignment = 'fill';

  var layoutGrp1 = layoutGrp.add('group');
  layoutGrp1.orientation = 'column';
  layoutGrp1.spacing = 2;
  layoutGrp1.alignment = 'left';
  var layoutGrp2 = layoutGrp.add('group');
  layoutGrp2.orientation = 'column';
  layoutGrp2.spacing = 2;
  layoutGrp2.alignment = 'right';

  var subtitulo_layoutGrp = layoutGrp1.add('group');
  var subtitulo_layout = subtitulo_layoutGrp.add('checkbox', undefined, '');
  var subtitulo_layoutTxt = subtitulo_layoutGrp.add('statictext', undefined, 'subtitulo');
  subtitulo_layoutTxt.characters = 6;
  setTxtColor(subtitulo_layoutTxt, GNEWS_mainColors2[3]);

  var foto_layoutGrp = layoutGrp1.add('group');
  var foto_layout = foto_layoutGrp.add('checkbox', undefined, '');
  var foto_layoutTxt = foto_layoutGrp.add('statictext', undefined, 'foto');
  foto_layoutTxt.characters = 6;
  setTxtColor(foto_layoutTxt, GNEWS_mainColors2[3]);

  var footage_layoutGrp = layoutGrp2.add('group');
  var footage_layout = footage_layoutGrp.add('checkbox', undefined, '');
  var footage_layoutTxt = footage_layoutGrp.add('statictext', undefined, 'footage');
  footage_layoutTxt.characters = 6;
  setTxtColor(footage_layoutTxt, GNEWS_mainColors2[3]);

  var pattern_layoutGrp = layoutGrp2.add('group');
  var pattern_layout = pattern_layoutGrp.add('checkbox', undefined, '');
  var pattern_layoutTxt = pattern_layoutGrp.add('statictext', undefined, 'pattern');
  pattern_layoutTxt.characters = 6;
  setTxtColor(pattern_layoutTxt, GNEWS_mainColors2[3]);

  var foto_layoutDrop = layoutGrp1.add('dropdownlist', [0, 0, 85, 10], []);
  var pattern_layoutDrop = layoutGrp2.add('dropdownlist', [0, 0, 85, 10], []);

  //---------------------------------------------------------

  divider = wPreset.add('panel');
  divider.alignment = 'fill';

  var servico_mainGrp = wPreset.add('group');
  servico_mainGrp.orientation = 'column';
  servico_mainGrp.alignChildren = 'left';
  servico_mainGrp.spacing = 8;
  servico_mainGrp.visible = false;
  var servicoTxt = servico_mainGrp.add('statictext', undefined, 'servico:');
  setTxtColor(servicoTxt, sTxtColor);

  var servicoArray = [
    '- formato livre -',
    '[dia]  [mes]  —  [hora]  [min]',
    'DIA  [dia]  —  [hora]  [min]',
    '[semana]  —  [hora]  [min]',
    'MAIS  TARDE  —  [hora]  [min]',
    'TODA  [semana]  —  [hora]  [min]',
    'EM  [mes]',
  ];
  var titulo_servico = servico_mainGrp.add('edittext', [0, 0, 180, 40], '', { multiline: true });
  var subtitulo_servico = servico_mainGrp.add('edittext', [0, 0, 180, 20], '');
  subtitulo_servico.enabled = subtitulo_layout.value;
  var formato_servicoDrop = servico_mainGrp.add('dropdownlist', [0, 0, 180, 10], servicoArray);

  var servicoGrp1 = servico_mainGrp.add('group');
  servicoGrp1.orientation = 'stack';

  var servicoGrp2 = servico_mainGrp.add('group');

  var semana_servicoDrop = servicoGrp1.add('dropdownlist', [0, 0, 180, 10], fullWeekArray);
  semana_servicoDrop.selection = obj.servico_end_page.semana - 1;
  var mes_servicoDrop = servicoGrp1.add('dropdownlist', [0, 0, 180, 10], fullMonthArray);
  mes_servicoDrop.selection = obj.servico_end_page.mes - 1;
  var livre_servico = servicoGrp1.add('edittext', [0, 0, 180, 20], '');

  var dia_servicoGrp = servicoGrp2.add('group');
  dia_servicoGrp.spacing = 6;
  var hora_servicoGrp = servicoGrp2.add('group');
  hora_servicoGrp.spacing = 6;
  var min_servicoGrp = servicoGrp2.add('group');
  min_servicoGrp.spacing = 6;

  var dia_servico = dia_servicoGrp.add('edittext', [0, 0, 25, 20], obj.servico_end_page.dia);
  var dia_servicoTxt = dia_servicoGrp.add('statictext', undefined, 'dia');
  setTxtColor(dia_servicoTxt, GNEWS_mainColors2[3]);

  var hora_servico = hora_servicoGrp.add('edittext', [0, 0, 25, 20], obj.servico_end_page.hora);
  var hora_servicoTxt = hora_servicoGrp.add('statictext', undefined, 'hora');
  setTxtColor(hora_servicoTxt, GNEWS_mainColors2[3]);

  var min_servico = min_servicoGrp.add('edittext', [0, 0, 25, 20], obj.servico_end_page.min);
  var min_servicoTxt = min_servicoGrp.add('statictext', undefined, 'min');
  setTxtColor(min_servicoTxt, GNEWS_mainColors2[3]);

  //---------------------------------------------------------

  divider = wPreset.add('panel');
  divider.alignment = 'fill';

  var aparencia_mainGrp = wPreset.add('group');
  aparencia_mainGrp.orientation = 'column';
  aparencia_mainGrp.alignChildren = 'left';
  aparencia_mainGrp.spacing = 8;
  aparencia_mainGrp.visible = false;
  var aparenciaTxt = aparencia_mainGrp.add('statictext', undefined, 'aparencia:');
  setTxtColor(aparenciaTxt, sTxtColor);
  var tema_aparenciaGrp = aparencia_mainGrp.add('group');
  tema_aparenciaGrp.alignChildren = 'left';

  var themeArray = [
    'claro',
    'cinza',
    'escuro',
    'vermelho',
    '- cores livres -',
  ];
  var tema_aparenciaDrop = tema_aparenciaGrp.add('dropdownlist', [0, 0, 180, 10], themeArray);

  var aparenciaGrp = aparencia_mainGrp.add('group');
  aparenciaGrp.orientation = 'stack';
  aparenciaGrp.alignment = 'fill';
  var aparenciaGrp1 = aparenciaGrp.add('group');
  aparenciaGrp1.orientation = 'column';
  aparenciaGrp1.spacing = 2;
  aparenciaGrp1.alignment = 'left';
  var aparenciaGrp2 = aparenciaGrp.add('group');
  aparenciaGrp2.orientation = 'column';
  aparenciaGrp2.spacing = 2;
  aparenciaGrp2.alignment = 'center';
  var aparenciaGrp3 = aparenciaGrp.add('group');
  aparenciaGrp3.orientation = 'column';
  aparenciaGrp3.spacing = 2;
  aparenciaGrp3.alignment = 'right';

  var logo_aparencia = aparenciaGrp1.add('statictext', undefined, '######');
  logo_aparencia.helpTip = 'logo';
  logo_aparencia.characters = 5;
  var titulo_aparencia = aparenciaGrp1.add('statictext', undefined, '######');
  titulo_aparencia.helpTip = 'titulo';
  titulo_aparencia.characters = 5;
  var subtitulo_aparencia = aparenciaGrp1.add('statictext', undefined, '######');
  subtitulo_aparencia.helpTip = 'subtitulo';
  subtitulo_aparencia.characters = 5;
  var apoio_aparencia = aparenciaGrp2.add('statictext', undefined, '######');
  apoio_aparencia.helpTip = 'apoio';
  apoio_aparencia.characters = 5;
  var horario_aparencia = aparenciaGrp2.add('statictext', undefined, '######');
  horario_aparencia.helpTip = 'horario';
  horario_aparencia.characters = 5;
  var horario_base_aparencia = aparenciaGrp2.add('statictext', undefined, '######');
  horario_base_aparencia.helpTip = 'horario base';
  horario_base_aparencia.characters = 5;
  var footage_aparencia = aparenciaGrp3.add('statictext', undefined, '######');
  footage_aparencia.helpTip = 'footage';
  footage_aparencia.characters = 5;
  var pattern_aparencia = aparenciaGrp3.add('statictext', undefined, '######');
  pattern_aparencia.helpTip = 'pattern';
  pattern_aparencia.characters = 5;
  var fundo_aparencia = aparenciaGrp3.add('statictext', undefined, '######');
  fundo_aparencia.helpTip = 'fundo';
  fundo_aparencia.characters = 5;

  //---------------------------------------------------------

  var bGrp = wPreset.add('group');
  bGrp.orientation = 'stack';
  bGrp.alignment = 'fill';

  var bGrp1 = bGrp.add('group');
  bGrp1.alignment = 'left';
  bGrp1.spacing = 2;

  var bGrp2 = bGrp.add('group');
  bGrp2.alignment = 'right';

  // sub group...
  var oGrp = bGrp1.add('group');
  oGrp.orientation = 'column';
  oGrp.spacing = 0;
  // refresh button...
  var refreshBtn = oGrp.add('iconbutton', undefined, upIcon, { style: 'toolbutton' });
  refreshBtn.helpTip = 'pull comp changes';
  // apply button...
  var applyBtn = oGrp.add('iconbutton', undefined, downIcon, { style: 'toolbutton' });
  applyBtn.helpTip = 'apply current changes';

  var openBtn = bGrp1.add('iconbutton', undefined, folderIcon, { style: 'toolbutton' });
  openBtn.helpTip = 'open end page presets folder';
  var saveBtn = bGrp2.add('button', undefined, 'save');
  saveBtn.helpTip = 'save new end page preset JSON file';

  //---------------------------------------------------------

  wPreset.onShow = function () {
    wPreset.size.height = 140;
    bGrp.location[1] = 90;
    updateObjLayers();
    compToUi_updateUi();
    getPresetNames();
  };

  //---------------------------------------------------------

  expRad01.onClick = function () {
    wPreset.size.height = 140;
    bGrp.location[1] = 90;
    layout_mainGrp.visible = false;
    aparencia_mainGrp.visible = false;
    servico_mainGrp.visible = false;
  };

  //---------------------------------------------------------

  expRad02.onClick = function () {
    wPreset.layout.layout(true);
    layout_mainGrp.visible = true;
    aparencia_mainGrp.visible = true;
    servico_mainGrp.visible = true;
  };

  //---------------------------------------------------------

  foto_layoutDrop.onChange = function () {
    var sLayer = uiToComp_updateLayers('comp_img apresentador', foto_layoutDrop);
    obj.layout_end_page.foto_layer = sLayer;
  };

  //---------------------------------------------------------

  pattern_layoutDrop.onChange = function () {
    var sLayer = uiToComp_updateLayers('comp_pattern', pattern_layoutDrop);
    obj.layout_end_page.pattern_layer = sLayer;
  };

  //---------------------------------------------------------

  presetDrop.onChange = function () {
    var fileName = presetDrop.selection.toString();
    var presetFile = new File(presetPath + '/' + fileName + '.json');

    if (!presetFile.exists) return;

    var presetStr = readFile(presetFile);
    obj = defaultEndPageObj(JSON.parse(presetStr));

    uiToComp_colors();
    compToUi_updateUi();
    uiToComp_updateCompFx();

    try {
      var aItem = app.project.activeItem;
      var titulo = titulo_servico.text;
      aItem.layer('txt_titulo')
        .property('ADBE Text Properties')
        .property('ADBE Text Document')
        .setValue(titulo);
      var subtitulo = subtitulo_servico.text;
      aItem.layer('txt_subtitulo')
        .property('ADBE Text Properties')
        .property('ADBE Text Document')
        .setValue(subtitulo);
      var hora = hora_servico.text.replace(/\D/g, '');
      hora = parseInt(hora);
      hora = hora < 23 ? hora : 23;
      aItem.layer('ctrl_comp')
        .property('ADBE Effect Parade')
        .property('servico end page')
        .property('[hora]')
        .setValue(hora);
      var min = min_servico.text.replace(/\D/g, '');
      min = parseInt(min);
      min = min < 59 ? min : 59;
      aItem.layer('ctrl_comp')
        .property('ADBE Effect Parade')
        .property('servico end page')
        .property('[min]')
        .setValue(min);
    } catch (error) { }
  };

  //---------------------------------------------------------

  applyBtn.onClick = function () {
    uiToComp_colors();
    uiToComp_updateCompFx();

    try {
      var aItem = app.project.activeItem;
      var titulo = titulo_servico.text;
      aItem.layer('txt_titulo')
        .property('ADBE Text Properties')
        .property('ADBE Text Document')
        .setValue(titulo);
      var subtitulo = subtitulo_servico.text;
      aItem.layer('txt_subtitulo')
        .property('ADBE Text Properties')
        .property('ADBE Text Document')
        .setValue(subtitulo);
      var servico = livre_servico.text;
      aItem.layer('txt_data e horario')
        .property('ADBE Text Properties')
        .property('ADBE Text Document')
        .setValue(servico);
      var hora = hora_servico.text.replace(/\D/g, '');
      hora = parseInt(hora);
      hora = hora < 23 ? hora : 23;
      aItem.layer('ctrl_comp')
        .property('ADBE Effect Parade')
        .property('servico end page')
        .property('[hora]')
        .setValue(hora);
      var min = min_servico.text.replace(/\D/g, '');
      min = parseInt(min);
      min = min < 59 ? min : 59;
      aItem.layer('ctrl_comp')
        .property('ADBE Effect Parade')
        .property('servico end page')
        .property('[min]')
        .setValue(min);
    } catch (error) { }
  };

  //---------------------------------------------------------

  modelo_layoutDrop.onChange = function () {
    try {
      uiToComp_setDropDownIndex(this, 'layout', 'modelo');
    } catch (error) {
      modelo_layoutDrop.selection = obj.layout_end_page.modelo - 1;
    }
  };

  //---------------------------------------------------------

  formato_servicoDrop.onChange = function () {
    try {
      uiToComp_setDropDownIndex(this, 'servico', 'formato');
      updateServicoUiVis();
    } catch (error) {
      formato_servicoDrop.selection = obj.servico_end_page.formato - 1;
      updateServicoUiVis();
    }
  };

  //---------------------------------------------------------

  mes_servicoDrop.onChange = function () {
    try {
      uiToComp_setDropDownIndex(this, 'servico', 'mes');
      updateServicoUiVis();
    } catch (error) {
      mes_servicoDrop.selection = obj.servico_end_page.mes - 1;
    }
  };

  //---------------------------------------------------------

  semana_servicoDrop.onChange = function () {
    try {
      uiToComp_setDropDownIndex(this, 'servico', 'semana');
    } catch (error) {
      semana_servicoDrop.selection = obj.servico_end_page.semana - 1;
    }
  };

  //---------------------------------------------------------

  livre_servico.onChanging = function () {
    try {
      var aItem = app.project.activeItem;
      var servico = livre_servico.text;
      aItem.layer('txt_data e horario')
        .property('ADBE Text Properties')
        .property('ADBE Text Document')
        .setValue(servico);
    } catch (error) {
      livre_servico.text = 'DIGITE O TEXTO';
    }
  };

  //---------------------------------------------------------

  livre_servico.onChange = function () {
    try {
      var aItem = app.project.activeItem;
      var servico = aItem.layer('txt_data e horario')
        .property('ADBE Text Properties')
        .property('ADBE Text Document');
        livre_servico.text = servico.value;
    } catch (error) { }
  };

  //---------------------------------------------------------

  titulo_servico.onChanging = function () {
    try {
      var aItem = app.project.activeItem;
      var titulo = titulo_servico.text;
      aItem.layer('txt_titulo')
        .property('ADBE Text Properties')
        .property('ADBE Text Document')
        .setValue(titulo);
    } catch (error) {
      titulo_servico.text = obj.servico_end_page.titulo;
    }
  };

  //---------------------------------------------------------

  titulo_servico.onChange = function () {
    try {
      var aItem = app.project.activeItem;
      var titulo = aItem.layer('txt_titulo')
        .property('ADBE Text Properties')
        .property('ADBE Text Document');
      obj.servico_end_page.titulo = titulo.value;
      titulo_servico.text = obj.servico_end_page.titulo;
    } catch (error) { }
  };

  //---------------------------------------------------------

  subtitulo_servico.onChanging = function () {
    try {
      var aItem = app.project.activeItem;
      var subtitulo = subtitulo_servico.text;
      aItem.layer('txt_subtitulo')
        .property('ADBE Text Properties')
        .property('ADBE Text Document')
        .setValue(subtitulo);
    } catch (error) {
      subtitulo_servico.text = obj.servico_end_page.subtitulo;
    }
  };

  //---------------------------------------------------------

  subtitulo_servico.onChange = function () {
    try {
      var aItem = app.project.activeItem;
      var subtitulo = aItem.layer('txt_subtitulo')
        .property('ADBE Text Properties')
        .property('ADBE Text Document');
      obj.servico_end_page.subtitulo = subtitulo.value;
      subtitulo_servico.text = obj.servico_end_page.subtitulo;
    } catch (error) { }
  };

  //---------------------------------------------------------

  dia_servico.onChanging = function () {
    try {
      var aItem = app.project.activeItem;
      var dia = dia_servico.text.replace(/\D/g, '');
      dia = dia != '' ? dia : '1';
      dia = parseInt(dia);
      dia = dia < 31 ? dia : 31;
      aItem.layer('ctrl_comp')
        .property('ADBE Effect Parade')
        .property('servico end page')
        .property('[dia]')
        .setValue(dia);

      obj.servico_end_page.dia = dia;
    } catch (error) {
      dia_servico.text = obj.servico_end_page.dia;
    }
  };

  //---------------------------------------------------------

  hora_servico.onChanging = function () {
    try {
      var aItem = app.project.activeItem;
      var hora = hora_servico.text.replace(/\D/g, '');
      hora = hora != '' ? hora : '0';
      hora = parseInt(hora);
      hora = hora < 23 ? hora : 23;
      aItem.layer('ctrl_comp')
        .property('ADBE Effect Parade')
        .property('servico end page')
        .property('[hora]')
        .setValue(hora);

      obj.servico_end_page.hora = hora;
    } catch (error) {
      hora_servico.text = obj.servico_end_page.hora;
    }
  };

  //---------------------------------------------------------

  hora_servico.onChange = function () {
    try {
      var aItem = app.project.activeItem;
      var hora = aItem.layer('ctrl_comp')
        .property('ADBE Effect Parade')
        .property('servico end page')
        .property('[hora]');

      hora_servico.text = hora.value;
    } catch (error) { }
  };

  //---------------------------------------------------------

  dia_servico.onChange = function () {
    try {
      var aItem = app.project.activeItem;
      var dia = aItem.layer('ctrl_comp')
        .property('ADBE Effect Parade')
        .property('servico end page')
        .property('[dia]');

      dia_servico.text = dia.value;
    } catch (error) { }
  };

  //---------------------------------------------------------

  min_servico.onChanging = function () {
    try {
      var aItem = app.project.activeItem;
      var min = min_servico.text.replace(/\D/g, '');
      min = min != '' ? min : '0';
      min = parseInt(min);
      min = min < 59 ? min : 59;
      aItem.layer('ctrl_comp')
        .property('ADBE Effect Parade')
        .property('servico end page')
        .property('[min]')
        .setValue(min);

      obj.servico_end_page.min = min;
    } catch (error) {
      min_servico.text = obj.servico_end_page.min;
    }
  };

  //---------------------------------------------------------

  min_servico.onChange = function () {
    try {
      var aItem = app.project.activeItem;
      var min = aItem.layer('ctrl_comp')
        .property('ADBE Effect Parade')
        .property('servico end page')
        .property('[min]');

      min_servico.text = min.value;
    } catch (error) { }
  };

  //---------------------------------------------------------

  tema_aparenciaDrop.onChange = function () {
    try {
      uiToComp_setDropDownIndex(this, 'aparencia', 'tema');
      compToUi_colors();
    } catch (error) {
      tema_aparenciaDrop.selection = obj.aparencia_end_page.tema - 1;
    }
  };

  //---------------------------------------------------------

  subtitulo_layout.onClick = function () {
    try {
      var val = uiToComp_layoutFxValue(this, 'subtitulo');
      subtitulo_servico.enabled = val;

      if (!val) {
        obj.servico_end_page.subtitulo = 'SUBTÍTULO';
        return;
      }
      obj.servico_end_page.subtitulo = subtitulo_servico.text;
    } catch (error) {
      subtitulo_layout.value = obj.layout_end_page.subtitulo;
    }
  };

  //---------------------------------------------------------

  foto_layout.onClick = function () {
    try {
      var val = uiToComp_layoutFxValue(this, 'foto');
      foto_layoutDrop.enabled = val;

      if (!val) {
        obj.layout_end_page.foto_layer = '-------';
        return;
      }
      obj.layout_end_page.foto_layer = foto_layoutDrop.selection;
    } catch (error) {
      foto_layout.value = obj.layout_end_page.foto;
    }
  };

  //---------------------------------------------------------

  footage_layout.onClick = function () {
    try {
      var val = uiToComp_layoutFxValue(this, 'footage');
    } catch (error) {
      footage_layout.value = obj.layout_end_page.footage;
    }
  };

  //---------------------------------------------------------

  pattern_layout.onClick = function () {
    try {
      var val = uiToComp_layoutFxValue(this, 'pattern');
      pattern_layoutDrop.enabled = val;

      if (!pattern_layout.value) {
        obj.layout_end_page.pattern_layer = '-------';
        return;
      }
      obj.layout_end_page.pattern_layer = pattern_layoutDrop.selection;
    } catch (error) {
      pattern_layout.value = obj.layout_end_page.pattern;
    }
  };

  //---------------------------------------------------------

  refreshBtn.onClick = function () {
    presetDrop.selection = 0;

    obj = defaultEndPageObj(buildFxObj()); // adds a default data value if needed...
    updateObjLayers();

    compToUi_updateUi();
    getPresetNames();

    try {
      var aItem = app.project.activeItem;
      livre_servico.text = textContent(aItem.layer('txt_data e horario'));
    } catch (error) { }
  };

  //---------------------------------------------------------

  saveBtn.onClick = function () {
    obj = defaultEndPageObj(buildFxObj()); // adds a default data value if needed...
    updateObjLayers();

    var fileName = titulo_servico.text
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .trim();

    var filePath = presetPath + '/' + fileName + '.json';
    var presetStr = JSON.stringify(obj, null, '\t');
    saveFile(presetStr, filePath);

    var presetArray = getPresetNames();

    if (presetArray.indexOf(fileName) < 0) return;

    presetDrop.selection = presetArray.indexOf(fileName);
  };

  //---------------------------------------------------------

  openBtn.onClick = function () {
    openFolder(presetPath);
  };

  wPreset.show();
}
