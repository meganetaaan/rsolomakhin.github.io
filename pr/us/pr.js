var details = {
  displayItems: [
    {
      label: 'Original donation amount',
      amount: {currency: 'USD', value: '65.00'}
    },
    {
      label: 'Friends and family discount',
      amount: {currency: 'USD', value: '-10.00'}
    },
    {
      label: 'Donation',
      amount: {currency: 'USD', value: '55.00'}
    }
  ]
};

function updateDetails(details, addr) {
  if (addr.regionCode == 'US') {
    var shippingOption = {
      id: '',
      label: '',
      amount: {currency: 'USD', value: '0.00'}
    };
    if (addr.administrativeArea == 'CA') {
      shippingOption.id = 'ca';
      shippingOption.label = 'Free shipping in California';
      details.displayItems[details.displayItems.length - 1].amount.value =
          '55.00';
    } else {
      shippingOption.id = 'us';
      shippingOption.label = 'Standard shipping in US';
      shippingOption.amount.value = '5.00';
      details.displayItems[details.displayItems.length - 1].amount.value =
          '60.00';
    }
    if (details.displayItems.length == 3) {
      details.displayItems.splice(-1, 0, shippingOption);
    } else {
      details.displayItems.splice(-2, 1, shippingOption);
    }
    details.shippingOptions = [shippingOption];
  } else {
    delete details.shippingOptions;
  }
  return details;
}

function onBuyClicked() {
  var supportedInstruments = [
    'https://android.com/pay', 'visa', 'mastercard', 'amex', 'discover',
    'maestro', 'diners', 'jcb', 'unionpay'
  ];

  var options = {requestShipping: true};

  var schemeData = {
    'https://android.com/pay': {
      'gateway': 'stripe',
      'stripe:publishableKey': 'pk_test_VKUbaXb3LHE7GdxyOBMNwXqa',
      'stripe:version': '2015-10-16 (latest)'
    }
  };

  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    var request =
        new PaymentRequest(supportedInstruments, details, options, schemeData);

    request.addEventListener('shippingaddresschange', e => {
      e.updateWith(new Promise((resolve, reject) => {
        resolve(updateDetails(details, request.shippingAddress));
      }));
    });

    request.show()
        .then(instrumentResponse => {
          window.setTimeout(() => {
            instrumentResponse.complete(true)
                .then(() => {
                  done(
                      'Thank you!', request.shippingAddress,
                      request.shippingOption, instrumentResponse.methodName,
                      instrumentResponse.details);
                })
                .catch(err => { error(err.message); });
          }, 2000);
        })
        .catch(err => { error(err.message); });

  } catch (e) {
    error('Developer mistake: \'' + e.message + '\'');
  }
}