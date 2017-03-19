'use strict';
var app = app || {};

app.Ingredients = Backbone.Collection.extend({

    model: app.Food,

    nutrition: function(macro) {
        var total = 0;
        _.each(this.toJSON(), function(food) {
            total += food[macro];
        });
        return total;
    }
});
