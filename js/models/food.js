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
    },

    url: function() {
        return 'https://api.nutritionix.com/v1_1/item?id=' + this.get('foodId') + '&appId=bf2d9982&appKey=fdf2de5c6c4fca7380026f2eead1f0f3';
    },

    // initialize: function() {}


});
