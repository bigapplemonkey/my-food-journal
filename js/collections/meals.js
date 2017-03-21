'use strict';
var app = app || {};

app.Meals = Backbone.Collection.extend({

    model: app.Meal,

    nutrition: function(macro) {
      console.log('here');
        var total = 0;
        _.each(this.models, function(meal) {
            total += meal.get('ingredients').nutrition(macro);
        });
        return total;
    }
});
