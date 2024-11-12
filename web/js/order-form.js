// Toggle categories on header click
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.category h2').forEach(categoryHeader => {
        categoryHeader.addEventListener('click', () => {
            const category = categoryHeader.parentElement;
            category.classList.toggle('active');
            const content = categoryHeader.nextElementSibling;
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });
    });
});

// Function to update counters
function updateCount(button, inputId, increment) {
    const input = document.getElementById(inputId);
    let count = parseInt(input.value);
    count = increment ? count + 1 : count - 1;
    input.value = count > 0 ? count : 0; // Ensure count doesn't go below 0
}

// Collect all category data
function getCategoryData() {
    const categories = [];
    document.querySelectorAll(".category").forEach((categorySection) => {
        const categoryTitle = categorySection.querySelector("h2").textContent;
        const items = [];

        categorySection.querySelectorAll(".item").forEach((item) => {
            const itemName = item.querySelector("span").textContent;
            const itemCount = parseInt(item.querySelector("input[type='text']").value);

            items.push({ name: itemName, count: itemCount });
        });

        categories.push({ category: categoryTitle, items: items });
    });

    return categories;
}

// Event listener for form submission
document.getElementById("contact-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const formData = new FormData(this);

    // Add category data to formData
    const categoryData = JSON.stringify(getCategoryData());
    formData.append("categories", categoryData);

    // Send form data to the backend
    fetch("http://localhost:5000/submit", {  // Adjust URL if necessary
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            // Redirect to the thank-you page on success
            window.location.href = "http://localhost:8080/danke.html";
        } else {
            alert("There was an error submitting the form. Please try again.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    });
});
