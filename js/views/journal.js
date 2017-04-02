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
        Backbone.on('mealDeleted', this.showDeleteMealModal, this);
        Backbone.on('foodSearch', this.showFoosSearchlModal, this);

        //Semantic-UI Elements' inizializations
        this.$('.ui.accordion')
            .accordion({
                exclusive: false
            });

        //Attaching meals if any
        var view = this;
        _.each(this.journal.get('meals').models, function(meal, index) {
            view.$mealsContainer.append(new app.MealView({ model: meal }).render(index === 0).el);
        });

        //Chart.js initialization
        app.chartHelper.initializeCharts(this.$('#myDoughnut'),
            this.$('#myLine'),
            this.journal.getMacros(),
            this.journal.getMealCalories());

        //Updating metris
        this.$metricsContainer.html(this.template(this.journal.attributes));

        //Show view
        this.$el.fadeIn('slow');
    },

    render: function() {
        var view = this;
        //Updating metris
        this.$metricsContainer.fadeOut('fast', function() {
            view.$metricsContainer.html(view.template(view.journal.attributes));
            view.$metricsContainer.fadeIn('fast');
        });
        return this;
    },

    addOneMeal: function(meal) {
        var mealView = new app.MealView({ model: meal });
        this.$mealsContainer.append(mealView.render(false).el);
        app.chartHelper.updateColumnChart(this.journal.getMealCalories());
    },

    removeOneMeal: function(meal) {
        meal.trigger('destroy', meal);
        if (meal.get('ingredients').length > 0) app.chartHelper.updateDonutChart(this.journal.getMacros());
        app.chartHelper.updateColumnChart(this.journal.getMealCalories());
    },

    showAddMealModal: function() {
        this.$modalHeader.text('Please enter a name for your meal');
        this.$modalAddButton.html('<i class="checkmark icon"></i>Add');
        this.$modalSearch.hide();
        this.$modalNameContainer.show();
        this.$modalInput.val('Meal ' + (this.journal.get('meals').length + 1));

        var view = this;
        this.$modal.modal({
                onHide: function() {
                    view.$modalInput.val('');
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
        app.chartHelper.updateDonutChart(this.journal.getMacros());
        app.chartHelper.updateColumnChart(this.journal.getMealCalories());
        this.render();
    },

    showDeleteMealModal: function(meal) {
        this.$modalHeader.text('Are you sure you want to delete ' + meal.get('name') + '?');
        this.$modalAddButton.html('<i class="checkmark icon"></i>Delete');
        this.$modalSearch.hide();
        this.$modalNameContainer.hide();
        var view = this;
        this.$modal.modal({
                onApprove: function() {
                    view.removeOneMeal(meal);
                }
            })
            .modal('show');
    },

    showFoosSearchlModal: function(meal) {
        this.$modalHeader.text('Search our food database');
        this.$modalAddButton.html('<i class="checkmark icon"></i>Add');
        this.$modalNameContainer.hide();
        this.$modalSearch.show();

        var view = this;
        this.$modal.modal({
                onApprove: function() {
                    console.log('yes');
                }
            })
            .modal('show');
    },

    pdfGenerator: function(userName) {
        app.pdfHelper.generatePDF(this.journal, userName);
    }
});
