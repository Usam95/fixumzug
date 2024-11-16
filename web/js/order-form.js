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


function displayFileNames(event) {
    const fileNamesContainer = document.getElementById("fileNames");
    fileNamesContainer.innerHTML = ""; // Clear previous file names

    const files = event.target.files;

    Array.from(files).forEach(file => {
        const fileNameDiv = document.createElement("div");
        fileNameDiv.textContent = file.name;
        fileNamesContainer.appendChild(fileNameDiv);
    });
}


// Array to store all selected files for easier management
let selectedFiles = [];

function previewPhotos(event) {
    const files = Array.from(event.target.files);
    
    // Add new selected files to our main `selectedFiles` array
    selectedFiles.push(...files);

    // Display previews
    renderPhotoPreviews();
}

function renderPhotoPreviews() {
    const photoPreviewContainer = document.getElementById("photoPreviewContainer");
    photoPreviewContainer.innerHTML = ""; // Clear previous previews

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const photoDiv = document.createElement("div");
            photoDiv.classList.add("photo-preview");

            const img = document.createElement("img");
            img.src = e.target.result;
            photoDiv.appendChild(img);

            const deleteIcon = document.createElement("span");
            deleteIcon.classList.add("delete-icon");
            deleteIcon.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Font Awesome trash icon
            deleteIcon.onclick = () => removePhoto(index); // Attach index to remove function
            photoDiv.appendChild(deleteIcon);

            photoPreviewContainer.appendChild(photoDiv);
        };

        reader.readAsDataURL(file);
    });
}

function removePhoto(index) {
    // Remove the file at the specified index from `selectedFiles`
    selectedFiles.splice(index, 1);

    // Update the preview display
    renderPhotoPreviews();
    
    // Update the input field's FileList with the remaining files
    const photoInput = document.querySelector('input[name="photos"]');
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach(file => dataTransfer.items.add(file));
    photoInput.files = dataTransfer.files;
}
