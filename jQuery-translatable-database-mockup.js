/*

  jQuery-translatable-database-mockup.js

  For testing purposes.

  Set a volatile database and bypass REST url services.

*/

var testingDB = {};

function testing_Key(langISO, termType, termID) {
  return langISO + '|' + termType + '|' + termID;
}
function testing_langListReader(callBack) {
  var langList = [{"name":"English","id":1,"isoCode":"en"}
                 ,{"name":"Spanish","id":2,"isoCode":"es"}
                 ,{"name":"French","id":3,"isoCode":"fr"}];
  if(callBack)
    callBack(langList);
  return langList;
}
function testing_translatableReader(langISO, termType, termID, callBack) {
  var key = testing_Key(langISO, termType, termID);
  var result = testingDB[key] || "";
  if(callBack)
    callBack(result);
  return result;
}
function testing_translatableWriter(langISO, termType, termID, translation, callBack) {
  var key = testing_Key(langISO, termType, termID);
  testingDB[key] = {langId: 0, termId: 0, translation: translation};
  var result = {result:"ok"};
  if(callBack)
    callBack(result);
  return result;
}

$(function() {

  $.translatable('bypassREST',
    testing_langListReader,
    testing_translatableReader,
    testing_translatableWriter
  );

});

