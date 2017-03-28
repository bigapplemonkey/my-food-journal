var app = app || {};

app.Meal = Backbone.Model.extend({
    defaults: {
        name: '',
        ingredients: null,
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0
    },

    initialize: function() {
        this.set('ingredients', new app.Ingredients());
        this.get('ingredients').on('add remove', this.updateMetrics, this);
    },

    updateMetrics: function() {
        this.set({
            calories: this.get('ingredients').nutrition('calories'),
            carbs: this.get('ingredients').nutrition('carbs'),
            protein: this.get('ingredients').nutrition('protein'),
            fat: this.get('ingredients').nutrition('fat')
        }, { silent: true });
    }
});
