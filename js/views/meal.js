var app = app || {};

app.MealView = Backbone.View.extend({

    tagName: 'div',

    template: _.template($('#meal-template').html()),

    initialize: function(options) {
        this.meal = this.model;

        this.$el.html(this.template(this.meal.attributes));
        this.$ingredientContainer = this.$('.ingredient-container');

        this.listenTo(this.meal, 'destroy', this.remove);
        this.listenTo(this.meal.get('ingredients'), 'add', this.addOneFood);
        // this.listenTo(this.meal.get('ingredients'), 'remove', this.removeOneFood);
    },

    render: function() {
        return this;
    },

    addOneFood: function(food) {

        var foodView = new app.FoodView({ model: food });
        console.log(foodView);
        this.$ingredientContainer.prepend(foodView.render().el);
        Backbone.trigger('ingredientAdd');
    },

    removeOneFood: function(food) {}
});
