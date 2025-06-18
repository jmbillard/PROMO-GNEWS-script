/*

---------------------------- info ----------------------------

  title:   PROMO GNEWS utilities script

  notes:   a collection of tools designed to
  speedup the motion graphics team workflow

  author:  Jean-Marc Billard
  version: xxx
  date:    xx-xx-2022

--------------------------------------------------------------

*/
//  jshint -W061

try {
  var scriptFile = new File('//egcdesign01.servicos.corp.tvglobo.com.br/cdesign/JORNALISMO/GLOBONEWS/PROMO/SCRIPTS/PROMO GNEWS.jsxbin');
  
  scriptFile.open('r');
	eval(scriptFile.read());
	
  scriptFile.close();

} catch (err) {
  alert('nope... (っ °Д °;)っ\n\n' + err.message);
}
