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
        Backbone.on('ingredientsUpdate', this.render, this);

        console.log(this.journal.get('meals'))

        var view = this;
        _.each(this.journal.get('meals').models, function(meal) {
            console.log(meal.attributes);
            console.log(view.$mealsContainer);
            view.$mealsContainer.append(new app.MealView({ model: meal }).render().el);
        });

        this.$metricsContainer.html(this.template(this.journal.attributes));
        this.$el.fadeIn('slow');

    },

    render: function() {
        var view = this;
        this.journal.updateMetrics();
        this.$metricsContainer.fadeOut('fast', function() {
            view.$metricsContainer.html(view.template(view.journal.attributes));
            view.$metricsContainer.fadeIn('fast');
        });


        return this;
    },

    addOneMeal: function(meal) {
        console.log("Adding!");
        console.log(meal);
        var mealView = new app.MealView({ model: meal });
        this.$mealsContainer.append(mealView.render().el);
        // this.render();
    },

    removeOneMeal: function(meal) {
        console.log("Removing!");
        meal.trigger('destroy', meal);
        if (meal.get('ingredients').length > 0) this.render();
    },

    ingredientAdd: function() {
        console.log('did it!');
    }
});
