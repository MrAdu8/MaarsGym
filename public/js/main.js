document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);
    } else if (document.getElementById('customerForm')) {
        document.getElementById('customerForm').addEventListener('submit', handleCustomerSubmit);
    } else if (document.getElementById('enquiryForm')) {
        document.getElementById('enquiryForm').addEventListener('submit', handleEnquirySubmit);
    }
});

function handleLoginSubmit(event) {
    event.preventDefault();
    const data = {
        Name: document.getElementById('loginName').value,
        Password: document.getElementById('loginPassword').value
    };
    console.log('Submitting login data:', data);
    
    fetch('/super/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log('Response status:', response.status);
        // Save the response status to check later
        const responseStatus = response.status;
        return response.json().then(result => ({ status: responseStatus, result }));
    })
    .then(({ status, result }) => {
        console.log('Full response:', result);
        if (result.message === 'Login Successfully' && status === 200) {
            window.location.href = 'dashboard.html';
        } else {
            alert(result.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}


function handleCustomerSubmit(event) {
    event.preventDefault();
    const data = {
        Name: document.getElementById('customerName').value,
        PhoneNo: document.getElementById('customerPhone').value,
        Email: document.getElementById('customerEmail').value,
        Address: document.getElementById('customerAddress').value,
        MedicalCondition: document.getElementById('customerMedical').value,
        Fees: document.getElementById('customerTotal').value,
        Coupon: document.getElementById('customerCoupon').value,
        months: document.getElementById('customerMonths').value
    };
    fetch('/customer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
      .then(result => {
          if (result.success) {
              alert('Customer added successfully.');
              document.getElementById('customerForm').reset();
          } else {
              alert(result.message);
          }
      });
}

function handleEnquirySubmit(event) {
    event.preventDefault();
    const data = {
        Name: document.getElementById('enquiryName').value,
        PhoneNo: document.getElementById('enquiryPhone').value,
        Email: document.getElementById('enquiryEmail').value
    };
    fetch('/enquiry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
      .then(result => {
          if (result.success) {
              alert('Enquiry added successfully.');
              document.getElementById('enquiryForm').reset();
          } else {
              alert('Failed to add enquiry.');
          }
      });
}
