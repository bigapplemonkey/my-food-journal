// js/app.js

var app = app || {};
var ENTER_KEY = 13;

$(function() {
    // Kick things off by creating the **App**.

    var food1 = new app.Food({ name: 'Oatmeal' });
    var food2 = new app.Food({ name: 'Banana' });
    var food3 = new app.Food({ name: 'Egg Whites' });
    var meal1 = new app.Meal({ name: 'Breakfast' });

    meal1.get('ingredients').add([food1, food2, food3]);
    app.Journal.get('meals').add(meal1);

    new app.JournalView({ model: app.Journal });

});
