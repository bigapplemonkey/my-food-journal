'use strict';
var app = app || {};

app.Food = Backbone.Model.extend({
    defaults: {
        name: 'Banana Pudding',
        brand: 'Acme',
        servings: 5,
        carbs: 4,
        protein: 3,
        fat: 7,
        calories: 23
    }

    // initialize: function() {}
});
