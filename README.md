(job in progress...)

jQuery-translatable
===================

What is?
--------

"jQuery-translatable" is a simple jQuery plugin to define certain HTML content as "translatable", that is, a user could edit certain HTML pieces to write one content version for each language configured.

What do you need to use it?
---------------------------

You must to define two REST url:

1. "LangList", without arguments return one JSON array of objects:

     1.1. "id", your own primary key
     1.2. "name", default (no translated) language name.
     1.3. "isoCode", standard language ISO code (eg. ISO 639-1 but could be another one)

    Example result:

     HTTP GET: http://server.com/translatable/list

     RESPONSE: [{"name":"English","id":1,"isoCode":"en"},{"name":"Spanish","id":2,"isoCode":"es"},{"name":"French","id":3,"isoCode":"fr"}]

2. "Translation", with three arguments:

     2.1. "langIsoCode", same value as [1.3].
     2.2. "termType", is a group key, you can see as "entities" to be translated (eg. ProductName, ProductDescription, UserDescription, ...)
     2.3. "termUID", is a mapping key, you can see as "record" to be translated (eg. product code "123", user code "456", ...)

     2.4. with PUT HTTP method you must store the provided content into key {langIsoCode, termType, termUID}. The JSON object is:

            2.4.1. "langId", same as [1.1]. Not used here.
            2.4.2. "termId", same as a internal "termUID" key. Not used here.
            2.4.3. "translation", text to store.

          A example POST:

            HTTP POST: http://server.com/translatable/en/TOWERNAME/1

            POST DATA: {"langId":0,"termId":0,"translation":"Tower of London!"}

            RESPONSE: {"result":"ok"}

          response could be one error message.

     2.5. with GET HTTP method you must return the previously stored content.

            2.5.1. "langId", same as [1.1]. Not used here.
            2.5.2. "termId", same as a internal "termUID" key. Not used here.
            2.5.3. "translation", text to store.

          A example GET:

            HTTP GET: http://server.com/translatable/en/TOWERNAME/1

            RESPONSE: {"translation":"Tower of London!"}

How to use at server runtime
----------------------------

The minimal persistent schema is:

    LANG
    ----
    id            primary key
    isoCode       char(2) unique
    name          text

    TERM
    ----
    id            primary key
    termType      text unique

    TRANSLATION
    -----------
    id            primary key
    lang_id       foreign key (LANG.id)
    term_id       foreign key (TERM.id)
    translation   text

but yes, you can use the super-minimal (not recommended) schema:

    TRANSLATION
    -----------
    isoCode       char(2)     on primary key
    termType      text        on primary key
    translation   text

with that information, you can translate *ALL* your application translatable content.

How to use "termType" and "termUID"
-----------------------------------

  