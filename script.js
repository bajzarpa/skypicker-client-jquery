/*jshint strict:false*/
/*global $, window, console, moment, toastr*/

/**
 * Used to find fligts by given params (described inner)
 * @type {string}
 */
var FLIGHTS_URL = 'https://api.skypicker.com/flights';


/**
 * Used to autocomplete the arrival/departure input's
 * @type {string}
 */
var PLACES_URL = 'https://api.skypicker.com/places';


var searchConfig = {
  fromDate: null,
  toDate: null,
  fromPlace: null,
  toPlace: null
};


function setUpDatePicker() {

  function onDateValueSet (dates) {
    var datesArray = dates.split('to');

    searchConfig.fromDate = datesArray[0].replace(' ', '');
    searchConfig.toDate = datesArray[1].replace(' ', '');

    return $(this).val(dates);
  }


  $('#date').dateRangePicker({
    startDate: new Date(),
    format: 'DD/MM/YYYY',
    setValue: onDateValueSet
  });

}

function setupAutoComplete() {
  function onSuggestionSelect(item) {
    var key = $(this).hasClass('from') ? 'fromPlace' : 'toPlace';
    searchConfig[key] = item.data;
  }

  function transformSuggestionsResponse(response) {
    response = JSON.parse(response);

    return {
      suggestions: $.map(response, function(item) {
        return { value: item.value, data: item.id };
      })
    };
  }

  $('.typeahead').autocomplete({
    serviceUrl: PLACES_URL + '?locale=en&v=2',
    paramName: 'term',
    minChars: 3,
    transformResult: transformSuggestionsResponse,
    onSelect: onSuggestionSelect

  });
}

/**
 *
 * @param {Object} response
 * @param {Number} response._results
 * @param {Array} response.data
 */
function onAjaxRequestSuccess(response) {
  var $errorMsg = $('.alert.alert-danger');

  if (!response._results) {
    $errorMsg.show();
  } else {
    $errorMsg.hide();

    response.data.forEach(function(result) { makeResultTemplate(result).appendTo('.results-wrapper'); });
  }
}

/**
 * 
 * @param {Object} data
 * @param {String} data.cityFrom
 * @param {String} data.cityTo
 * @param {String} data.fly_duration
 * @param {String} data.price
 * @param {Date} data.aTime
 * @param {Date} data.dTime
 *
 * @returns {jQuery|HTMLElement}
 */
function makeResultTemplate(data) {
  return $('<div class="col col-3"><div class="card"><div class="card-header">' + data.cityFrom + '<i class="fa fa-long-arrow-right"/>'+ data.cityTo + '</div>'+
    '<div class="card-block"><h4 class="card-title">'+data.price+' Eur</h4><p class="card-text">Duration: '+ data.fly_duration +'</p></div>'+
    '<div class="card-footer text-muted"><p>Arrival: '+normalizeUnixTimestamp(data.aTime)+'</p><p>Departure: '+normalizeUnixTimestamp(data.dTime)+'</p></div></div></div>');
}

function normalizeUnixTimestamp(timestamp) {
  return moment.unix(timestamp).format('YYYY-MM-DD H:m');
}

function onAjaxRequestError() {
  toastr.error('There were an error while communicating with server.');
}

function onFormsubmit() {
  $.ajax({
    url: FLIGHTS_URL,
    data: {
      v: '2',
      locale: 'en',
      typeFlight: 'return',
      flyFrom: searchConfig.fromPlace,
      to: searchConfig.toPlace,
      dateFrom: searchConfig.fromDate,
      dateTo: searchConfig.fromDate,
      returnFrom: searchConfig.toDate,
      returnTo: searchConfig.toDate
    }
  })
    .done(onAjaxRequestSuccess)
    .fail(onAjaxRequestError);

  return false;
}

/**
 * Search bar controlling functionality
 */
var searchBar = function() {

  setUpDatePicker();
  setupAutoComplete();

  $(document).on('submit', 'form', onFormsubmit);

};

/**
 * Collect the controlling methods here
 */
var initialize = function () {
  /* more of your methods, plugins, eventhandlers etc... */
  searchBar();
};


/**
 * Start our app when the document
 * finished loading the neccessary stuff
 */
$(document).ready(initialize);