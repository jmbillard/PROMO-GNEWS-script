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
  var obj = buildFxObj();
  // alert(obj);
  defaultEndPageObj(obj); // adds a default data value if needed...

  var servico = obj.servico_end_page; // service data object...
  var layout = obj.layout_end_page; // layout data object...
  var aparencia = obj.aparencia_end_page; // color theme data object...
  function updateObjLayers() {
    try {
      var aItem = app.project.activeItem; // current selected project item...

      servico.titulo = textContent(aItem.layer('txt_titulo')); // layer 'txt_titulo' text content...
      servico.subtitulo = textContent(aItem.layer('txt_subtitulo')); // layer 'txt_subtitulo' text content...

      try {
        var patComp = aItem.layer('comp_pattern').source; // pattern precomp layer...

        // get the first enabled layer...
        for (var l = 1; l <= patComp.numLayers; l++) {
          if (patComp.layer(l).enabled) {
            layout.pattern_layer = patComp.layer(l).name; // first enabled layer → pattern layer name...
            break;
          }
        }
      } catch (error) {}
      try {
        var fotoComp = aItem.layer('comp_img apresentador').source; // host image precomp layer...

        // get the first enabled layer...
        for (var f = 1; f <= fotoComp.numLayers; f++) {
          if (fotoComp.layer(f).name.match(/adj_/)) continue; // ignore adjustment layers...

          if (fotoComp.layer(f).enabled) {
            layout.foto_layer = fotoComp.layer(f).name; // first enabled layer → photo layer name...
            break;
          }
        }
      } catch (error) {}
    } catch (error) {}
  }

  // get preset file names..
  function getPresetNames() {
    presetDdl.removeAll();

    var filesArray = presetFolder.getFiles();
    var presetArray = ['new end page preset'];

    for (var f = 0; f < filesArray.length; f++) {
      var fileName = deleteFileExt(filesArray[f].displayName);
      presetArray.push(fileName);
    }
    populateDropdownList(presetArray, presetDdl);
    presetDdl.selection = 0;

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
    } catch (error) {}

    return layersArray;
  }

  // enable selected layer...
  function showLayer(compName, dropdown) {
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
    } catch (error) {}
    return selectedLayerName;
  }

  // update current first enabled layer as index...
  function updateUiLayers() {
    var pattern = layout.pattern_layer;
    var foto = layout.foto_layer;
    var patternArray = getLayers('comp_pattern', pattern_layoutDdl);
    var p = patternArray.indexOf(pattern);

    if (p >= 0) {
      pattern_layoutDdl.selection = p; // → pattern index
    }
    var fotoArray = getLayers('comp_img apresentador', foto_layoutDdl);
    var f = fotoArray.indexOf(foto);
    if (f >= 0) {
      foto_layoutDdl.selection = f; // → photo index
    }
  }

  // update window ui controls..
  function updateUi() {
    updateUiLayers();

    modelo_layoutDdl.selection = layout.modelo - 1;
    subtitulo_layout.value = layout.subtitulo;
    footage_layout.value = layout.footage;
    foto_layout.value = layout.foto;
    foto_layoutDdl.enabled = layout.foto;
    pattern_layout.value = layout.pattern;
    pattern_layoutDdl.enabled = layout.pattern;

    titulo_servico.text = servico.titulo;
    subtitulo_servico.text = servico.subtitulo;
    subtitulo_servico.visible = layout.subtitulo;
    hora_servico.text = servico.hora;
    min_servico.text = servico.min;
    dia_servico.text = servico.dia;
    formato_servicoDdl.selection = servico.formato - 1;
    mes_servicoDdl.selection = servico.mes - 1;
    semana_servicoDdl.selection = servico.semana - 1;

    tema_aparenciaDdl.selection = aparencia.tema - 1;

    updateUiColors();
    servicoUiVis();
  }

  function updateCompFx() {
    try {
      var aItem = app.project.activeItem;
      var layoutFx = aItem.layer('ctrl_comp').property('ADBE Effect Parade').property('layout end page');
      layoutFx.property('subtitulo').setValue(layout.subtitulo);
      layoutFx.property('foto').setValue(layout.foto);
      layoutFx.property('footage').setValue(layout.footage);
      layoutFx.property('pattern').setValue(layout.pattern);
    } catch (error) {}
  }

  function servicoUiVis() {
    var i = formato_servicoDdl.selection.index;

    data_servicoGrp.visible = false;
    dia_servicoGrp.visible = false;
    semana_servicoDdl.visible = false;
    mes_servicoDdl.visible = false;
    hora_servicoGrp.visible = false;
    min_servicoGrp.visible = false;

    if (i == 1) {
      data_servicoGrp.visible = true;
      dia_servicoGrp.visible = true;
      semana_servicoDdl.visible = false;
      mes_servicoDdl.visible = true;
      hora_servicoGrp.visible = true;
      min_servicoGrp.visible = true;
    }
    if (i == 2) {
      data_servicoGrp.visible = true;
      dia_servicoGrp.visible = true;
      semana_servicoDdl.visible = false;
      hora_servicoGrp.visible = true;
      min_servicoGrp.visible = true;
    }
    if (i == 3 || i == 5) {
      data_servicoGrp.visible = true;
      dia_servicoGrp.visible = false;
      semana_servicoDdl.visible = true;
      hora_servicoGrp.visible = true;
      min_servicoGrp.visible = true;
    }
    if (i == 4) {
      hora_servicoGrp.visible = true;
      min_servicoGrp.visible = true;
    }
    if (i == 6) {
      mes_servicoDdl.visible = true;
    }
  }

  function updateCompColors() {
    try {
      var aItem = app.project.activeItem;
      var aparenciaFx = aItem.layer('ctrl_comp').property('ADBE Effect Parade').property('aparencia end page');
      aparenciaFx.property('logo').setValue(hexToRGB(aparencia.logo));
      aparenciaFx.property('titulo').setValue(hexToRGB(aparencia.titulo));
      aparenciaFx.property('subtitulo').setValue(hexToRGB(aparencia.subtitulo));
      aparenciaFx.property('apoio').setValue(hexToRGB(aparencia.apoio));
      aparenciaFx.property('horario').setValue(hexToRGB(aparencia.horario));
      aparenciaFx.property('horario base').setValue(hexToRGB(aparencia.horario_base));
      aparenciaFx.property('footage').setValue(hexToRGB(aparencia.footage));
      aparenciaFx.property('pattern').setValue(hexToRGB(aparencia.pattern));
      aparenciaFx.property('fundo').setValue(hexToRGB(aparencia.fundo));
    } catch (error) {}
  }

  function updateUiColors() {
    setTxtColor(logo_aparencia, hexToRGB(aparencia.logo));
    logo_aparencia.text = aparencia.logo;
    setTxtColor(titulo_aparencia, hexToRGB(aparencia.titulo));
    titulo_aparencia.text = aparencia.titulo;
    setTxtColor(subtitulo_aparencia, hexToRGB(aparencia.subtitulo));
    subtitulo_aparencia.text = aparencia.subtitulo;
    setTxtColor(apoio_aparencia, hexToRGB(aparencia.apoio));
    apoio_aparencia.text = aparencia.apoio;
    setTxtColor(horario_aparencia, hexToRGB(aparencia.horario));
    horario_aparencia.text = aparencia.horario;
    setTxtColor(horario_base_aparencia, hexToRGB(aparencia.horario_base));
    horario_base_aparencia.text = aparencia.horario_base;
    setTxtColor(footage_aparencia, hexToRGB(aparencia.footage));
    footage_aparencia.text = aparencia.footage;
    setTxtColor(pattern_aparencia, hexToRGB(aparencia.pattern));
    pattern_aparencia.text = aparencia.pattern;
    setTxtColor(fundo_aparencia, hexToRGB(aparencia.fundo));
    fundo_aparencia.text = aparencia.fundo;
  }

  // set layout property value...
  function setCompLayoutFxValue(thisObj, property) {
    var aItem = app.project.activeItem;
    var val = thisObj.value;
    var subtituloFx = aItem.layer('ctrl_comp').property('ADBE Effect Parade').property('layout end page').property(property).setValue(val);
    layout[property] = val;

    return val;
  }

  // set dropdown property index...
  function setCompFxIndex(thisObj, obj, property) {
    var aItem = app.project.activeItem;
    var i = thisObj.selection.index + 1;
    var modeloFx = aItem
      .layer('ctrl_comp')
      .property('ADBE Effect Parade')
      .property(obj + ' end page')
      .property(property)
      .setValue(i);
    eval(obj + '.' + property + ' =' + i);

    return i;
  }

  var w = new Window('palette', 'end page preset...');
  w.spacing = 30;
  var preset_mainGrp = w.add('group');
  preset_mainGrp.orientation = 'column';
  var presetDdl = preset_mainGrp.add('dropdownlist', [0, 0, 180, 10], []);
  var radGrp = preset_mainGrp.add('group');
  var expRad01 = radGrp.add('radiobutton', undefined, 'simple ui');
  expRad01.value = true;
  expRad01.helpTip = 'only presets';
  var expRad02 = radGrp.add('radiobutton', undefined, 'extended ui');
  expRad02.helpTip = 'full editor';

  var layout_mainGrp = w.add('group');
  layout_mainGrp.orientation = 'column';
  layout_mainGrp.visible = false;
  layout_mainGrp.spacing = 8;
  var layoutTxt = layout_mainGrp.add('statictext', undefined, '- LAYOUT -');
  setTxtColor(layoutTxt, GNEWS_secColors[8]);
  var modelo_layoutDdl = layout_mainGrp.add('dropdownlist', [0, 0, 180, 10], ['livre', 'programa', 'jornal']);

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
  setTxtColor(subtitulo_layoutTxt, GNEWS_mainColors[7]);

  var foto_layoutGrp = layoutGrp1.add('group');
  var foto_layout = foto_layoutGrp.add('checkbox', undefined, '');
  var foto_layoutTxt = foto_layoutGrp.add('statictext', undefined, 'foto');
  foto_layoutTxt.characters = 6;
  setTxtColor(foto_layoutTxt, GNEWS_mainColors[7]);

  var footage_layoutGrp = layoutGrp2.add('group');
  var footage_layout = footage_layoutGrp.add('checkbox', undefined, '');
  var footage_layoutTxt = footage_layoutGrp.add('statictext', undefined, 'footage');
  footage_layoutTxt.characters = 6;
  setTxtColor(footage_layoutTxt, GNEWS_mainColors[7]);

  var pattern_layoutGrp = layoutGrp2.add('group');
  var pattern_layout = pattern_layoutGrp.add('checkbox', undefined, '');
  var pattern_layoutTxt = pattern_layoutGrp.add('statictext', undefined, 'pattern');
  pattern_layoutTxt.characters = 6;
  setTxtColor(pattern_layoutTxt, GNEWS_mainColors[7]);

  var foto_layoutDdl = layoutGrp1.add('dropdownlist', [0, 0, 85, 10], []);
  var pattern_layoutDdl = layoutGrp2.add('dropdownlist', [0, 0, 85, 10], []);

  var servico_mainGrp = w.add('group');
  servico_mainGrp.orientation = 'column';
  servico_mainGrp.spacing = 8;
  servico_mainGrp.visible = false;
  var servicoTxt = servico_mainGrp.add('statictext', undefined, '- SERVICO -');
  setTxtColor(servicoTxt, GNEWS_secColors[8]);

  var titulo_servico = servico_mainGrp.add('edittext', [0, 0, 180, 40], '', { multiline: true });
  var subtitulo_servico = servico_mainGrp.add('edittext', [0, 0, 180, 20], '');
  subtitulo_servico.visible = subtitulo_layout.value;
  var formato_servicoDdl = servico_mainGrp.add(
    'dropdownlist',
    [0, 0, 180, 10],
    [
      '- formato livre -',
      '[dia]  [mes]  —  [hora]  [min]',
      'DIA  [dia]  —  [hora]  [min]',
      '[semana]  —  [hora]  [min]',
      'MAIS  TARDE  —  [hora]  [min]',
      'TODA  [semana]  —  [hora]  [min]',
      'EM  [mes]',
    ]
  );

  var servicoGrp = servico_mainGrp.add('group');
  servicoGrp.orientation = 'stack';
  servicoGrp.alignment = 'fill';

  var servicoGrp1 = servicoGrp.add('group');
  servicoGrp1.orientation = 'column';
  servicoGrp1.alignment = 'left';
  var servicoGrp2 = servicoGrp.add('group');
  servicoGrp2.orientation = 'column';
  servicoGrp2.alignment = 'right';

  var data_servicoGrp = servicoGrp1.add('group');
  data_servicoGrp.orientation = 'stack';
  var dia_servicoGrp = data_servicoGrp.add('group');
  var dia_servico = dia_servicoGrp.add('edittext', [0, 0, 40, 20], servico.dia);
  var dia_servicoTxt = dia_servicoGrp.add('statictext', undefined, '[dia]');
  setTxtColor(dia_servicoTxt, GNEWS_mainColors[7]);
  var semana_servicoDdl = data_servicoGrp.add('dropdownlist', [0, 0, 85, 10], ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'HOJE']);
  semana_servicoDdl.selection = servico.semana - 1;
  var hora_servicoGrp = servicoGrp1.add('group');
  var hora_servico = hora_servicoGrp.add('edittext', [0, 0, 40, 20], servico.hora);
  var hora_servicoTxt = hora_servicoGrp.add('statictext', undefined, '[hora]');
  setTxtColor(hora_servicoTxt, GNEWS_mainColors[7]);
  var mes_servicoDdl = servicoGrp2.add('dropdownlist', [0, 0, 85, 10], ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']);
  mes_servicoDdl.selection = servico.mes - 1;
  var min_servicoGrp = servicoGrp2.add('group');
  var min_servico = min_servicoGrp.add('edittext', [0, 0, 40, 20], servico.min);
  var min_servicoTxt = min_servicoGrp.add('statictext', undefined, '[min]');
  setTxtColor(min_servicoTxt, GNEWS_mainColors[7]);

  var aparencia_mainGrp = w.add('group');
  aparencia_mainGrp.orientation = 'column';
  aparencia_mainGrp.spacing = 8;
  aparencia_mainGrp.visible = false;
  var aparenciaTxt = aparencia_mainGrp.add('statictext', undefined, '- APARENCIA -');
  setTxtColor(aparenciaTxt, GNEWS_secColors[8]);
  var tema_aparenciaGrp = aparencia_mainGrp.add('group');
  tema_aparenciaGrp.alignChildren = 'left';
  var tema_aparenciaDdl = tema_aparenciaGrp.add('dropdownlist', [0, 0, 180, 10], ['claro', 'cinza', 'escuro', 'vermelho', '- cores livres -']);

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

  var logo_aparencia = aparenciaGrp1.add('statictext', undefined, '');
  logo_aparencia.helpTip = 'logo';
  logo_aparencia.characters = 5;
  var titulo_aparencia = aparenciaGrp1.add('statictext', undefined, '');
  titulo_aparencia.helpTip = 'titulo';
  titulo_aparencia.characters = 5;
  var subtitulo_aparencia = aparenciaGrp1.add('statictext', undefined, '');
  subtitulo_aparencia.helpTip = 'subtitulo';
  subtitulo_aparencia.characters = 5;
  var apoio_aparencia = aparenciaGrp2.add('statictext', undefined, '');
  apoio_aparencia.helpTip = 'apoio';
  apoio_aparencia.characters = 5;
  var horario_aparencia = aparenciaGrp2.add('statictext', undefined, '');
  horario_aparencia.helpTip = 'horario';
  horario_aparencia.characters = 5;
  var horario_base_aparencia = aparenciaGrp2.add('statictext', undefined, '');
  horario_base_aparencia.helpTip = 'horario base';
  horario_base_aparencia.characters = 5;
  var footage_aparencia = aparenciaGrp3.add('statictext', undefined, '');
  footage_aparencia.helpTip = 'footage';
  footage_aparencia.characters = 5;
  var pattern_aparencia = aparenciaGrp3.add('statictext', undefined, '');
  pattern_aparencia.helpTip = 'pattern';
  pattern_aparencia.characters = 5;
  var fundo_aparencia = aparenciaGrp3.add('statictext', undefined, '');
  fundo_aparencia.helpTip = 'fundo';
  fundo_aparencia.characters = 5;

  var bGrp = w.add('group');
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
  var refreshBtn = oGrp.add('iconbutton', undefined, upIcon, {style: 'toolbutton'});
  refreshBtn.helpTip = 'pull comp changes';
  // apply button...
  var applyBtn = oGrp.add('iconbutton', undefined, downIcon, {style: 'toolbutton'});
  applyBtn.helpTip = 'apply current changes';
  
  var openBtn = bGrp1.add('iconbutton', undefined, folderIcon, { style: 'toolbutton' });
  openBtn.helpTip = 'open end page presets folder';
  var saveBtn = bGrp2.add('button', undefined, 'save');
  saveBtn.helpTip = 'save new end page preset JSON file';

  // value subtracted from the window height -> simple ui
  // var sHeight = 510;

  w.onShow = function () {
    w.size.height = 130;
    bGrp.location[1] = 80;
    updateObjLayers();
    updateUi();
    getPresetNames();
  };

  expRad01.onClick = function () {
    w.size.height = 130;
    bGrp.location[1] = 80;
    layout_mainGrp.visible = false;
    aparencia_mainGrp.visible = false;
    servico_mainGrp.visible = false;
  };

  expRad02.onClick = function () {
    w.layout.layout(true);
    layout_mainGrp.visible = true;
    aparencia_mainGrp.visible = true;
    servico_mainGrp.visible = true;
  };

  foto_layoutDdl.onChange = function () {
    var sLayer = showLayer('comp_img apresentador', foto_layoutDdl);
    layout.foto_layer = sLayer;
  };

  pattern_layoutDdl.onChange = function () {
    var sLayer = showLayer('comp_pattern', pattern_layoutDdl);
    layout.pattern_layer = sLayer;
  };

  presetDdl.onChange = function () {
    var fileName = presetDdl.selection.toString();
    var presetFile = new File(presetPath + '/' + fileName + '.json');

    if (!presetFile.exists) {
      return;
    }

    var presetStr = readFile(presetFile);
    obj = defaultEndPageObj(JSON.parse(presetStr));

    layout = obj.layout_end_page;
    servico = obj.servico_end_page;
    aparencia = obj.aparencia_end_page;

    updateCompColors();
    updateUi();
    updateCompFx();

    try {
      var aItem = app.project.activeItem;
      var titulo = titulo_servico.text;
      aItem.layer('txt_titulo').property('ADBE Text Properties').property('ADBE Text Document').setValue(titulo);
      var subtitulo = subtitulo_servico.text;
      aItem.layer('txt_subtitulo').property('ADBE Text Properties').property('ADBE Text Document').setValue(subtitulo);
      var hora = hora_servico.text.replace(/\D/g, '');
      hora = parseInt(hora);
      hora = hora < 23 ? hora : 23;
      aItem.layer('ctrl_comp').property('ADBE Effect Parade').property('servico end page').property('[hora]').setValue(hora);
      var min = min_servico.text.replace(/\D/g, '');
      min = parseInt(min);
      min = min < 59 ? min : 59;
      aItem.layer('ctrl_comp').property('ADBE Effect Parade').property('servico end page').property('[min]').setValue(min);
    } catch (error) {}
  };

  applyBtn.onClick = function () {
    // alert('foi');
    layout = obj.layout_end_page;
    servico = obj.servico_end_page;
    aparencia = obj.aparencia_end_page;

    updateCompColors();
    updateCompFx();

    try {
      var aItem = app.project.activeItem;
      var titulo = titulo_servico.text;
      aItem.layer('txt_titulo').property('ADBE Text Properties').property('ADBE Text Document').setValue(titulo);
      var subtitulo = subtitulo_servico.text;
      aItem.layer('txt_subtitulo').property('ADBE Text Properties').property('ADBE Text Document').setValue(subtitulo);
      var hora = hora_servico.text.replace(/\D/g, '');
      hora = parseInt(hora);
      hora = hora < 23 ? hora : 23;
      aItem.layer('ctrl_comp').property('ADBE Effect Parade').property('servico end page').property('[hora]').setValue(hora);
      var min = min_servico.text.replace(/\D/g, '');
      min = parseInt(min);
      min = min < 59 ? min : 59;
      aItem.layer('ctrl_comp').property('ADBE Effect Parade').property('servico end page').property('[min]').setValue(min);
    } catch (error) {}
  };

  modelo_layoutDdl.onChange = function () {
    try {
      setCompFxIndex(this, 'layout', 'modelo');
    } catch (error) {
      modelo_layoutDdl.selection = layout.modelo - 1;
    }
  };

  formato_servicoDdl.onChange = function () {
    try {
      setCompFxIndex(this, 'servico', 'formato');
      servicoUiVis();
    } catch (error) {
      formato_servicoDdl.selection = servico.formato - 1;
      servicoUiVis();
    }
  };

  mes_servicoDdl.onChange = function () {
    try {
      setCompFxIndex(this, 'servico', 'mes');
      servicoUiVis();
    } catch (error) {
      mes_servicoDdl.selection = servico.mes - 1;
    }
  };

  semana_servicoDdl.onChange = function () {
    try {
      setCompFxIndex(this, 'servico', 'semana');
    } catch (error) {
      semana_servicoDdl.selection = servico.semana - 1;
    }
  };

  titulo_servico.onChanging = function () {
    try {
      var aItem = app.project.activeItem;
      var titulo = titulo_servico.text;
      aItem.layer('txt_titulo').property('ADBE Text Properties').property('ADBE Text Document').setValue(titulo);
    } catch (error) {
      titulo_servico.text = servico.titulo;
    }
  };

  titulo_servico.onChange = function () {
    try {
      var aItem = app.project.activeItem;
      var titulo = aItem.layer('txt_titulo').property('ADBE Text Properties').property('ADBE Text Document');
      servico.titulo = titulo.value;
      titulo_servico.text = servico.titulo;
    } catch (error) {}
  };

  subtitulo_servico.onChanging = function () {
    try {
      var aItem = app.project.activeItem;
      var subtitulo = subtitulo_servico.text;
      aItem.layer('txt_subtitulo').property('ADBE Text Properties').property('ADBE Text Document').setValue(subtitulo);
    } catch (error) {
      subtitulo_servico.text = servico.subtitulo;
    }
  };

  subtitulo_servico.onChange = function () {
    try {
      var aItem = app.project.activeItem;
      var subtitulo = aItem.layer('txt_subtitulo').property('ADBE Text Properties').property('ADBE Text Document');
      servico.subtitulo = subtitulo.value;
      subtitulo_servico.text = servico.subtitulo;
    } catch (error) {}
  };

  dia_servico.onChanging = function () {
    try {
      var aItem = app.project.activeItem;
      var dia = dia_servico.text.replace(/\D/g, '');
      dia = dia != '' ? dia : '1';
      dia = parseInt(dia);
      dia = dia < 31 ? dia : 31;
      aItem.layer('ctrl_comp').property('ADBE Effect Parade').property('servico end page').property('[dia]').setValue(dia);

      servico.dia = dia;
    } catch (error) {
      dia_servico.text = servico.dia;
    }
  };

  hora_servico.onChanging = function () {
    try {
      var aItem = app.project.activeItem;
      var hora = hora_servico.text.replace(/\D/g, '');
      hora = hora != '' ? hora : '0';
      hora = parseInt(hora);
      hora = hora < 23 ? hora : 23;
      aItem.layer('ctrl_comp').property('ADBE Effect Parade').property('servico end page').property('[hora]').setValue(hora);

      servico.hora = hora;
    } catch (error) {
      hora_servico.text = servico.hora;
    }
  };

  hora_servico.onChange = function () {
    try {
      var aItem = app.project.activeItem;
      var hora = aItem.layer('ctrl_comp').property('ADBE Effect Parade').property('servico end page').property('[hora]');

      hora_servico.text = hora.value;
    } catch (error) {}
  };

  dia_servico.onChange = function () {
    try {
      var aItem = app.project.activeItem;
      var dia = aItem.layer('ctrl_comp').property('ADBE Effect Parade').property('servico end page').property('[dia]');

      dia_servico.text = dia.value;
    } catch (error) {}
  };

  min_servico.onChanging = function () {
    try {
      var aItem = app.project.activeItem;
      var min = min_servico.text.replace(/\D/g, '');
      min = min != '' ? min : '0';
      min = parseInt(min);
      min = min < 59 ? min : 59;
      aItem.layer('ctrl_comp').property('ADBE Effect Parade').property('servico end page').property('[min]').setValue(min);

      servico.min = min;
    } catch (error) {
      min_servico.text = servico.min;
    }
  };

  min_servico.onChange = function () {
    try {
      var aItem = app.project.activeItem;
      var min = aItem.layer('ctrl_comp').property('ADBE Effect Parade').property('servico end page').property('[min]');

      min_servico.text = min.value;
    } catch (error) {}
  };

  tema_aparenciaDdl.onChange = function () {
    try {
      setCompFxIndex(this, 'aparencia', 'tema');
      updateUiColors();
    } catch (error) {
      tema_aparenciaDdl.selection = aparencia.tema - 1;
    }
  };

  subtitulo_layout.onClick = function () {
    try {
      var val = setCompLayoutFxValue(this, 'subtitulo');
      subtitulo_servico.visible = val;

      if (!val) {
        servico.subtitulo = 'SUBTÍTULO';
        return;
      }
      servico.subtitulo = subtitulo_servico.text;
    } catch (error) {
      subtitulo_layout.value = layout.subtitulo;
    }
  };

  foto_layout.onClick = function () {
    try {
      var val = setCompLayoutFxValue(this, 'foto');
      foto_layoutDdl.enabled = val;

      if (!val) {
        layout.foto_layer = '-------';
        return;
      }
      layout.foto_layer = foto_layoutDdl.selection;
    } catch (error) {
      foto_layout.value = layout.foto;
    }
  };

  footage_layout.onClick = function () {
    try {
      var val = setCompLayoutFxValue(this, 'footage');
    } catch (error) {
      footage_layout.value = layout.footage;
    }
  };

  pattern_layout.onClick = function () {
    try {
      var val = setCompLayoutFxValue(this, 'pattern');
      pattern_layoutDdl.enabled = val;

      if (!pattern_layout.value) {
        layout.pattern_layer = '-------';
        return;
      }
      layout.pattern_layer = pattern_layoutDdl.selection;
    } catch (error) {
      pattern_layout.value = layout.pattern;
    }
  };

  refreshBtn.onClick = function () {
    presetDdl.selection = 0;

    obj = buildFxObj();
    defaultEndPageObj(obj); // adds a default data value if needed...

    servico = obj.servico_end_page; // service data object...
    layout = obj.layout_end_page; // layout data object...
    aparencia = obj.aparencia_end_page; // color theme data object...

    updateObjLayers();
    updateUi();
    getPresetNames();
  };

  saveBtn.onClick = function () {
    var fileName = titulo_servico.text.replace(/\s+/g, ' ').toLowerCase().trim();
    var filePath = presetPath + '/' + fileName + '.json';
    var presetStr = endPageObjToString(obj);
    saveFile(presetStr, filePath);

    var presetArray = getPresetNames();

    if (presetArray.indexOf(fileName) < 0) {
      return;
    }

    presetDdl.selection = presetArray.indexOf(fileName);
  };

  openBtn.onClick = function () {
    openFolder(presetPath);
  };

  w.show();
}
