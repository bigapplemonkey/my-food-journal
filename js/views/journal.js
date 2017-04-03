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
        this.foodSearchSelection = {};

        //Caching selectors
        this.$mealsContainer = this.$('.meals-container');
        this.$metricsContainer = this.$('.statistics');
        this.$modalHeader = this.$('.modal-header');
        this.$modalAddButton = this.$('#addButton');
        this.$modalSearch = this.$('.search-container');
        this.$modalNameContainer = this.$('.name-container');
        this.$modal = $('.ui.basic.modal');
        this.$modalNameInput = this.$('.name-input');
        this.$modalSearchInput = this.$('.prompt');
        this.$modalQuantityInput = this.$('.quantity-input');

        //Listening some events
        this.listenTo(this.journal.get('meals'), 'add', this.addOneMeal);
        this.listenTo(this.journal.get('meals'), 'remove', this.removeOneMeal);
        Backbone.on('ingredientsUpdate', this.ingredientsUpdate, this);
        Backbone.on('mealDeleted', this.showDeleteMealModal, this);
        Backbone.on('foodSearch', this.showFoodSearchlModal, this);

        //Semantic-UI Elements' inizializations
        this.$('.ui.accordion')
            .accordion({
                exclusive: false
            });
        this.initializeFoodSearch();

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
        this.$modalNameInput.val('Meal ' + (this.journal.get('meals').length + 1));
        this.$modalAddButton.removeClass('disabled');

        var view = this;
        this.$modal.modal({
                onHide: function() {
                    view.$modalNameInput.val('');
                },
                onApprove: function() {
                    view.$modalAddButton.addClass('disabled');
                    var name = view.$modalNameInput.val();
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
        this.$modalAddButton.removeClass('disabled');

        var view = this;
        this.$modal.modal({
                onApprove: function() {
                    view.$modalAddButton.addClass('disabled');
                    view.removeOneMeal(meal);
                }
            })
            .modal('show');
    },

    showFoodSearchlModal: function(meal) {
        this.$modalHeader.text('Search our food database');
        this.$modalAddButton.html('<i class="checkmark icon"></i>Add');
        this.$modalNameContainer.hide();
        this.$modalSearch.show();
        this.$modalSearchInput.val('');
        this.$modalQuantityInput.val('1.0');
        this.foodSearchelection = {};
        this.$modalAddButton.removeClass('disabled');

        var view = this;
        this.$modal.modal({
                onApprove: function() {
                    view.$modalAddButton.addClass('disabled');
                    var food = new app.Food({
                        foodId: view.foodSearchSelection.item_id,
                        servings: view.$modalQuantityInput.val()
                    });
                    //TODO: Move this fetch callback out of the view
                    food.fetch({
                        success: function(response) {
                            var qty = food.get('servings');
                            food.set('name', response.attributes.item_name);
                            food.set('brand', response.attributes.brand_name);
                            food.set('carbs', response.attributes.nf_total_carbohydrate ? Math.round(response.attributes.nf_total_carbohydrate * qty) : 0);
                            food.set('protein', response.attributes.nf_protein ? Math.round(response.attributes.nf_protein * qty) : 0);
                            food.set('fat', response.attributes.nf_total_fat ? Math.round(response.attributes.nf_total_fat * qty) : 0);
                            food.set('calories', response.attributes.nf_calories ? Math.round(response.attributes.nf_calories * qty) : 0);
                            meal.get('ingredients').add(food);
                        }
                    });
                }
            })
            .modal('show');
    },

    initializeFoodSearch: function() {
        var view = this;
        this.$('.ui.search')
            .search({
                apiSettings: {
                    url: 'https://api.nutritionix.com/v1_1/search/{query}?fields=item_name%2Citem_id%2Cbrand_name%2Cnf_calories%2Cnf_total_fat&appId=bf2d9982&appKey=fdf2de5c6c4fca7380026f2eead1f0f3',
                    onResponse: function(response) {
                        // console.log(response);
                        // console.log(_.pluck(response.hits, 'fields'));
                        // console.log(response.hits.length + ' - ' + response.total_hits);
                        var hits = _.pluck(response.hits, 'fields');
                        _.each(hits, function(item) {
                            item.display = item.brand_name + '- <strong>' + Math.round(item.nf_calories) + ' kcal</strong>';
                        });
                        return {
                            hits: hits
                        };
                    }
                },
                fields: {
                    results: 'hits',
                    title: 'item_name',
                    description: 'display'
                },
                onSelect: function(result, response) {
                    console.log(result);
                    view.foodSearchSelection = result;
                },
                minCharacters: 2,
                maxResults: 10
            });
    },

    pdfGenerator: function(userName) {
        app.pdfHelper.generatePDF(this.journal, userName);
    }
});
