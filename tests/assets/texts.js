function test() {
    // example strings which should be properly extracted:
    tr("Boom");
    tr("Roos");
    tr("Vis", "Vuur");
}

function test2() {
    tr("Hij zei, \"hallo!\"");
    tr("Zó leren lezen");
    tr("Goede 's morgens!");
    tr('Goede \'s avonds!');
    tr("Regel één\n" +
       'Regel twee');
    tr("Regel één\n" +
       'Regel twee\n' +
       "Regel drie");
}

function test3() {
    $(".some-element").attr("Attribute should not be extracted");
}

function test4() {
    i18n.tr("i18n.tr() should be extracted too");
    unknown.tr("unknown.tr() should not be extracted");
}
