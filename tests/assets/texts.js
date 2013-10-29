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
    tr("Regel één\nRegel twee");
}
