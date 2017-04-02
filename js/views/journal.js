'use strict';
var app = app || {};

app.JournalView = Backbone.View.extend({

    el: '#journal-container',

    template: _.template($('#metrics-template').html()),

    events: {
        'click #addMeal': 'showAddMealModal'
    },

    initialize: function() {
        //View's model
        this.journal = this.model;

        //Caching selectors
        this.$mealsContainer = this.$('.meals-container');
        this.$metricsContainer = this.$('.statistics');
        this.$modalHeader = this.$('.modal-header');
        this.$modalAddButton = this.$('#addButton');
        this.$modalSearch = this.$('.search-container');
        this.$modalNameContainer = this.$('.name-container');
        this.$modal = $('.ui.basic.modal');
        this.$modalInput = this.$('.name-input');

        //Listening some events
        this.listenTo(this.journal.get('meals'), 'add', this.addOneMeal);
        this.listenTo(this.journal.get('meals'), 'remove', this.removeOneMeal);
        Backbone.on('ingredientsUpdate', this.ingredientsUpdate, this);

        //Semantic-UI Elements' inizializations
        this.$('.ui.accordion')
            .accordion({
                exclusive: false
            });

        //Attaching meals if any
        var view = this;
        _.each(this.journal.get('meals').models, function(meal) {
            view.$mealsContainer.append(new app.MealView({ model: meal }).render().el);
        });

        //Chart.js initialization
        app.chartHelper.initializeCharts(this.$('#myDoughnut'), this.$('#myLine'), this.journal.getMacros());

        //Updating metris
        this.$metricsContainer.html(this.template(this.journal.attributes));

        //Show view
        this.$el.fadeIn('slow');
    },

    render: function() {
        var view = this;
        //Updating metris and charts
        this.$metricsContainer.fadeOut('fast', function() {
            view.$metricsContainer.html(view.template(view.journal.attributes));
            view.$metricsContainer.fadeIn('fast');
        });
        app.chartHelper.updateDonutChart(this.journal.getMacros());

        return this;
    },

    addOneMeal: function(meal) {
        var mealView = new app.MealView({ model: meal });
        this.$mealsContainer.append(mealView.render().el);
    },

    removeOneMeal: function(meal) {
        meal.trigger('destroy', meal);
        if (meal.get('ingredients').length > 0) this.render();
    },

    showAddMealModal: function() {
        this.$modalHeader.text('Please enter a name for your meal');
        this.$modalAddButton.html('<i class="checkmark icon"></i>Add');
        this.$modalSearch.hide();
        this.$modalNameContainer.show();

        var view = this;
        this.$modal.modal({
                onHide: function() {
                    console.log('Hidden');
                },
                onApprove: function() {
                    var name = view.$modalInput.val();
                    view.journal.get('meals').add({ name: name });
                }
            })
            .modal('show');
    },

    ingredientsUpdate: function() {
        this.journal.updateMetrics();
        this.render();
    },

    pdfGenerator: function(userName) {
        app.pdfHelper.generatePDF(this.journal, userName);
    }
});
