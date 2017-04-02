var app = app || {};

app.MealView = Backbone.View.extend({

    tagName: 'div',

    template: _.template($('#meal-template').html()),

    events: {
        'click #deleteMeal': 'promptMealDeletion',
        'click #addFood': 'promptFoodSearch'
    },

    initialize: function(options) {
        this.meal = this.model;

        this.$el.html(this.template(this.meal.attributes));

        this.$ingredientContainer = this.$('.ingredient-container');
        this.$macroTotals = this.$('.total.macro');
        this.$totalTag = this.$('.total-tag');
        this.$deleteMealButton = this.$('#deleteMeal');

        this.listenTo(this.meal, 'destroy', this.remove);
        this.listenTo(this.meal.get('ingredients'), 'add', this.addOneFood);
        this.listenTo(this.meal.get('ingredients'), 'remove', this.removeOneFood);

        var view = this;
        _.each(this.meal.get('ingredients').models, function(food) {
            view.$ingredientContainer.prepend(new app.FoodView({ model: food }).render().el);
        });
    },

    render: function(isFirst) {
        if (isFirst) this.$deleteMealButton.addClass('disabled');
        return this;
    },

    addOneFood: function(food) {
        var foodView = new app.FoodView({ model: food });
        this.$ingredientContainer.prepend(foodView.render().el);
        Backbone.trigger('ingredientsUpdate');
        this.updateTotals();
    },

    removeOneFood: function(food) {
        Backbone.trigger('ingredientsUpdate');
        this.updateTotals();
    },

    updateTotals: function() {
        var macros = this.meal.values();
        var view = this;

        this.$macroTotals.fadeOut('fast', function() {
            view.$macroTotals.each(function(i) {
                $(this).text(macros[i + 2]);
            });
            view.$macroTotals.fadeIn('fast');
        });

        this.$totalTag.slideToggle(300, function() {
            view.$totalTag.text(macros[2] + ' kcal');
            view.$totalTag.slideToggle(300);
        });

    },

    promptMealDeletion: function() {
        Backbone.trigger('mealDeleted', this.meal);
    },

    promptFoodSearch: function() {
        Backbone.trigger('foodSearch', this.meal);
    }
});
