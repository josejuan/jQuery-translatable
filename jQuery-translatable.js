(function ($) {

  // HTML element data attribute ids
  var DATA_UID = "translatableuid";
  var DATA_TYPE = "translatabletype";

  // CSS class
  var CSS_TRANSLATABLE = "translatable-translatable";
  var CSS_UPDATABLE = "translatable-updatable";
  
  var _langListReader = function(callBack) {
    var result = "(data unavailable)";
    $.ajax({
      type: "GET",
      url: config.langListReaderUrl,
      async: !!callBack,
      success: (!!callBack ? callBack : function(r){result = r})
    });
    return result;
  };

  var _translatableReader = function(langISO, termType, termID, callBack) {
    var result = "(data unavailable)";
    $.ajax({
      type: "GET",
      url: config.translatableReader + "/" + langISO + "/" + termType + "/" + termID,
      async: !!callBack,
      success: (!!callBack ? callBack : function(r){result = r})
    });
    return result;
  };

  var _translatableWriter = function(langISO, termType, termID, translation, callBack) {
    var result = "(response unavailable)";
    $.ajax({
      type: "POST",
      url: config.translatableReader + "/" + langISO + "/" + termType + "/" + termID,
      datatype: 'json',
      data: JSON.stringify({langId: 0, termId: 0, translation: translation}),
      async: !!callBack,
      success: (!!callBack ? callBack : function(r){result = r})
    });
    return result;
  };

  var config = { currentLanguage: "en"

               // language list datasource
               , langListReaderUrl: null
               , langListReader: _langListReader

               // translatable READ/WRITE datasource
               , translatableReaderUrl: null
               , translatableReader: _translatableReader
               , translatableWriterUrl: null
               , translatableWriter: _translatableWriter

               , pluginTermType: "TRANSLATABLEMESSAGES"
               };

  var tfEditing = function (landISO, termType, termID, updatedCallBack) {
    _langListReader(
      function(_r) {
        var r = $(_r);
        var $div = $('<div />').attr('title', 'Translating text:');
        $div.append(
          '<ul>' +
          r.map(function() {
            return '<li><a href="#lang' + this.id + '">' + this.name + '</a></li>'
          }).get().join('') +
          '</ul>' +
          r.map(function() {
            return '<div id="lang' + this.id + '"><textarea style="width: 440px; height: 150px" /></div>'
          }).get().join('')
        );
        $(document.body).append($div);
        r.each(function() {
          var i = this;
          _translatableReader(
            i.isoCode,
            termType,
            termID,
            function(x) {
              $('#lang' + i.id).find('textarea').
                val(x.translation).
                data('updated', 0).
                change(function(){$(this).data('updated', 1)});
            }
          )
        });
        $div.
        dialog({
          width: 500,
          height: 300,
          modal: true,
          buttons: {
            "Save": function() {
              var $d = $(this);
              // no parallelize (invalidate sqlite3 to parallelize?)
              var update = function (ix) {
                if(ix < _r.length) {
                  var $t =  $('#lang' + _r[ix].id).find('textarea');
                  if(~~$t.data('updated')) {
                    _translatableWriter(
                      _r[ix].isoCode,
                      termType,
                      termID,
                      $t.val(),
                      function () { update(ix + 1) }
                    );
                  } else {
                    update(ix + 1)
                  }
                } else {
                  $d.dialog( "close" );
                  $div.remove();
                  if(updatedCallBack) updatedCallBack();
                }
              };
              update(0);
            },
            Cancel: function() {
              $(this).dialog( "close" );
              $div.remove();
            }
          }
        }).
        tabs();
      }
    );
  };
  
  var methods = {
    configure: function(new_config) {
      config = $.extend({}, config, new_config);
    },
    initControls: function(mode) {
      if(mode) {
        $("*").
          filter(function(){return $(this).data("translatable") == mode}).
          translatable(mode);
      } else {
        $.translatable('initControls', 'translatable');
        $.translatable('initControls', 'updatable');
      }
    },
    get: function(termID, termType, langISO, callBack) {
      if(!langISO) langISO = config.currentLanguage;
      return _translatableReader(langISO, termType, termID, callBack);
    },
    update: function() {
      return this.each(function() {
        var o = $(this);
        var i = o.data(DATA_UID), t = o.data(DATA_TYPE);
        $.translatable(
          'get', i, t, null,
          function(r) { o.text(r.translation ? r.translation : (t + ':' + i)) }
        );
      });
    },
    lang: function (newLang) {
      if(!newLang) return config.currentLanguage;
      return config.currentLanguage = newLang;
    },
    updateAll: function() {
      $('*').filter(function(){return !!$(this).data(DATA_UID)}).translatable('update');
    },
    translatable: function(termID, termType) {
      return this.each(function() {
        var o = $(this);
        o.
          translatable('updatable', termID, termType).
          addClass(CSS_TRANSLATABLE).
          click(function(){
            var i = o.data(DATA_UID), t = o.data(DATA_TYPE);
            tfEditing(
              config.currentLanguage, t, i,
              function() { $('*').filter(function(){
                return $(this).data(DATA_UID) == i && $(this).data(DATA_TYPE) == t}).translatable('update') }
            );
          });
      });
    },
    updatable: function(termID, termType) {
      return this.each(function() {
        var o = $(this);
        if(termID) o.data(DATA_UID, termID);
        if(termType) o.data(DATA_TYPE, termType);
        $(this).
          addClass(CSS_UPDATABLE).
          translatable('update');
      });
    },
    bypassREST: function(new_langListReader, new_translatableReader, new_translatableWriter) {
      _langListReader = new_langListReader;
      _translatableReader = new_translatableReader;
      _translatableWriter = new_translatableWriter;
    }
  };
  $.translatable = $.fn.translatable = function (fn) {
    if (methods[fn])
      return methods[fn].apply(this, Array.prototype.slice.call(arguments, 1));
    if (typeof fn === 'object' || !fn)
      return methods.init.apply(this, arguments);
    $.error('Method ' + fn + ' does not exist on jQuery.translatable');
  };
})(jQuery);
