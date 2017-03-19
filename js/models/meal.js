var app = app || {};

app.Meal = Backbone.Model.extend({
    defaults: {
        name: '',
        carbs: 10,
        protein: 10,
        fat: 10,
        calories: 150
    },

    initialize: function() {
        this.set('ingredients', new app.Ingredients());
        // var self = this;
        // var updateMacros = function() {
        //     self.set('carbs', self.get('ingredients').nutrition('carbs'));
        //     self.set('protein', self.get('ingredients').nutrition('protein'));
        //     self.set('fat', self.get('ingredients').nutrition('fat'));
        //     self.set('calories', self.get('ingredients').nutrition('calories'));
        // };
        // this.bind('add:ingredients', updateMacros);
    }


});
