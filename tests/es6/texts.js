import Model from 'model';
import tr from 'gettext';
import Framework from 'framework';

class TestCase {
    constructor() {

    }

    validate() {
        var model = new Model();
        model.save().then(bla => {
            this.send("success", tr("Hallo from es6!"))
        });
    }
}

export default TestCase;

export default Framework.Controller.extend({
    init: function() {
        var [name, b, c] = arguments[0];
        this.set("foobar", tr("hallo {{name}} ", {name: name}));

        tr("September", { comment: "Translators: use all lower-case if months are not " +
                               "capitalized in your language" })

        tr("May");
        tr("May", { context: "Abbreviation", comment: "Abbreviation of May" });
        tr("September");
        tr("Sept.", { context: "Abbreviation", comment: "Abbreviation of September" });
    }
})