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

        /// Say hallo will contain a name
        this.set("foobar", tr("hallo {{name}} ", {name: name}));
    }
});
