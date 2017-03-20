var app = app || {};

app.JournalView = Backbone.View.extend({

    el: '#journal-container',

    template: _.template($('#metrics-template').html()),

    initialize: function() {
        this.journal = this.model;

        this.$mealsContainer = this.$('.meals-container');
        this.$metricsContainer = this.$('.statistics');

        this.listenTo(this.journal.get('meals'), 'add', this.addOneMeal);
        this.listenTo(this.journal.get('meals'), 'remove', this.removeOneMeal);

        Backbone.on('ingredientAdd', this.render, this);

        this.render();
    },

    render: function() {
        this.$metricsContainer.html(this.template(this.journal.attributes));
        return this;
    },

    addOneMeal: function(meal) {
        console.log("Adding!");
        var mealView = new app.MealView({ model: meal });
        this.$mealsContainer.append(mealView.render().el);
        this.render();
    },

    removeOneMeal: function(meal) {
        console.log("Removing!");
        meal.trigger('destroy', meal);
        this.render();
    },

    ingredientAdd: function() {
        console.log('did it!');
    }
});
