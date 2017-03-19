var app = app || {};

app.MealView = Backbone.View.extend({

    tagName: 'div',

    template: _.template($('#meal-template').html()),

    initialize: function() {
        this.meal = this.model;
        this.listenTo(this.meal, 'destroy', this.remove);
    },

    render: function() {
        this.$el.html(this.template(this.meal.attributes));
        return this;
    },

    addOneFood: function(food) {},

    removeOneFood: function(food) {}
});
