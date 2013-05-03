(job in progress...)

# jQuery-translatable

## What is?

"jQuery-translatable" is a simple jQuery plugin to define certain HTML content as "translatable", that is, a user could edit certain HTML pieces to write one content version for each language configured.

A demo is available (probably, I work a lot and maybe I'm working now in that demo... :P ) [here](http://yesod-testing.computer-mind.com/static/ajaxTest.html "jQuery-translatable demo").

## What do you need to use it?

You must to define two REST url:

1. "LangList", without arguments return one JSON array of objects:

    1.1. "id", your own primary key

    1.2. "name", default (no translated) language name.

    1.3. "isoCode", standard language ISO code (eg. ISO 639-1 but could be another one)

    1.4. Example result:

            HTTP GET: http://server.com/translatable/list
            RESPONSE: [{"name":"English","id":1,"isoCode":"en"},{"name":"Spanish","id":2,"isoCode":"es"},{"name":"French","id":3,"isoCode":"fr"}]

2. "Translation", with three arguments:

    2.1. "langIsoCode", same value as [1.3].

    2.2. "termType", is a group key, you can see as "entities" to be translated (eg. ProductName, ProductDescription, UserDescription, ...)

    2.3. "termUID", is a mapping key, you can see as "record" to be translated (eg. product code "123", user code "456", ...)

    2.4. with PUT HTTP method you must store the provided content into key {langIsoCode, termType, termUID}. The JSON object is a string:

            "This is some text" // text to store.
     
         A example POST:
     
            HTTP POST: http://server.com/translatable/en/TOWERNAME/1
            POST DATA: "Tower of London!"
            RESPONSE: {"result":"ok"} // response could be one error message.

    2.5. with GET HTTP method you must return the previously stored content.

         A example GET:

                HTTP GET: http://server.com/translatable/en/TOWERNAME/1
                RESPONSE: {"translation":"Tower of London!"}

## How it works

Any translatable element has one unique key to be identified.

But I think is better split that key into two subkeys.

### Terms Types

The first subkey is a group, class, kind, ... describing term type.

As "termType", the subkey "Product" is not valid because a product has many subterms: name, description, usage, ...

Then, you must define different "termType" for each one: "ProductName", "ProductDescription", "ProductUsage", ...

Really, this differentiation is not needed, but is useful to me (and prevent key content collisions).

### Terms UID

That subkey, store the specific element to be translated.

If you have two product ( **A** and **B** ), each product have her own "termUID".

Really, the "termUID" could be the primary key of that element (if you define "termType"!).

### Recommendations

"termType" is very useful to me. You can define your "translatable entities" schema independently of specific primary keys (easily).

You can define a normalized hierarchy:

    System.Page.HomePage
    System.Page.CustomerProfile
    ...
    DataBase.Product.Name
    DataBase.Product.Description
    ...

Then, many "termUID" could be generated for each "termType":

    System.Page.HomePage
        Title
        Description
        KeyWords

    System.Page.CustomerProfile
        Title
        Description
        KeyWords

    ...

    DataBase.Product.Name
        <primary key Product table>

    DataBase.Product.Description
        <primary key Product table>

    ...

### Working modes

You only should use "jQuery-translatable" when you wish to grant users to edit translatable content (that is, when users are translating).

Moreover, you should protect REST url to prevent unauthorized modifications into your translations database.

Then, in "only translating mode" you only render your text controls using the translations database.

Only in "editing translations mode" you will include "jQuery-translatable" and initialize translatable controls (see below).

## How to use at server runtime

The minimal persistent schema is:

    LANG:
    id            primary key
    isoCode       char(2) unique
    name          text

    TERM:
    id            primary key
    termType      text
    termUID       text

        Unique (termType, termID)

    TRANSLATION:
    id            primary key
    lang_id       foreign key (LANG.id)
    term_id       foreign key (TERM.id)
    translation   text

but yes, you can use the super-minimal (not recommended) schema:

    TRANSLATION:
    isoCode       char(2)     on primary key
    termType      text        on primary key
    termUID       text        on primary key
    translation   text

with that information, you can translate **ALL** your application translatable content.

### Server runtime in "only translating mode"

You can use your translated data directly.

Use some database cache is recommended.

To internationalize your control, you can use your framework infrastructure (if any).

For example, in [Yesod Web Framework](http://www.yesodweb.com/ "Yesod") you could overload **_{MsgUserMessage}** to read translated data from database.

If using Microsoft .Net you could define a [Resource Provider](http://msdn.microsoft.com/en-us/library/aa905797.aspx "Extending the ASP.NET 2.0 Resource-Provider Model") to use translated text in a Microsoft compliant way.

You can, of course, define you own function to read (and caching) data from database.

### Server runtime in "editing translations mode"

All HTML control that you wish to be translatable must be initialized.

Currently, the only one way is to call:

        $(some-element).translatable('translatable') // if you wish the control have be editable
        $(some-element).translatable('updatable')    // the control have not be editable (only update if another control with same keys is editable)

at server runtime, you can add three html attributes to your elements

* "data-translatable", with "updatable" or "translatable".
* "data-translatableType", with the "termType" code.
* "data-translatableUID", with the "termUID" code.

for example

        <h4 data-translatable="translatable" data-translatableType="SYSTEMMESSAGE" data-translatableUID="TOWERSOURCEURL" />

then, you can initialize all translatable controls (only needed in "editing translations mode", not in "only translating mode") with something like

        var initTranslatable = function(mode) {
            $("*").
              filter(function(){return $(this).data("translatable") == mode}).
              translatable(mode);
        };
        initTranslatable("translatable");
        initTranslatable("updatable");
