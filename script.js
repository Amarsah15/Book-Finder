document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://api.freeapi.app/api/v1/public/books";
    const booksContainer = document.getElementById("booksContainer");
    const searchBar = document.getElementById("searchBar");
    const sortOptions = document.getElementById("sortOptions");
    const toggleViewBtn = document.getElementById("toggleView");
    const loadMoreBtn = document.getElementById("loadMore");
    const loader = document.querySelector('.loader');

    let books = [];
    let unsortedBooks = []; // Stores a copy of books for sorting purposes
    let pageIndex = 1; // Pagination index
    let isGridView = false; // Track the current view mode
    let initialBooks = []; // Stores initially fetched books

    // Fetch books from API and update UI
    async function fetchBooks() {
        try {
            loader.style.display = 'none'; // Hide loader
            const response = await fetch(`${API_URL}?page=${pageIndex}&limit=10`);
            const data = await response.json();
            books = [...data.data.data]; // Store fetched books
            initialBooks.push(...data.data.data);
            unsortedBooks = initialBooks.slice(); // Copy for sorting

            // Set default view to Grid when page loads
            booksContainer.classList.add("grid-view");
            booksContainer.classList.remove("list-view");
            toggleViewBtn.textContent = "Switch to List View";
            isGridView = true;

            displayBooks(); // Render books on UI
        } catch (error) {
            loader.style.display = 'inline-block'; // Show loader in case of an error
            booksContainer.innerHTML = `<div class="error">Something went wrong, try again later</div>`;
        }
    }

    // Display books dynamically
    function displayBooks() {
        books.forEach(book => booksContainer.appendChild(createBookElement(book)));
    }

    // Create a book element with details
    function createBookElement(book) {
        const bookInfo = book.volumeInfo;
        const bookDiv = document.createElement("div");
        bookDiv.classList.add("book");
        bookDiv.innerHTML = `
            <a class="image-a" href="${bookInfo.infoLink}" target="_blank">
                <img src="${bookInfo.imageLinks?.thumbnail || 'placeholder.jpg'}" alt="Book Cover">
            </a>
            <div>
                <a href="${bookInfo.infoLink}" target="_blank">
                    <h3>${bookInfo.title}</h3>
                    <p><strong>Author:</strong> ${bookInfo.authors?.join(", ") || "Unknown"}</p>
                    <p><strong>Publisher:</strong> ${bookInfo.publisher || "N/A"}</p>
                    <p><strong>Published Date:</strong> ${bookInfo.publishedDate || "N/A"}</p>
                </a>
            </div>
        `;
        return bookDiv;
    }

    // Search books based on title or author
    searchBar.addEventListener("input", () => {
        loadMoreBtn.style.display = "none"
        const query = searchBar.value.toLowerCase();
        if(query === ""){
            loadMoreBtn.style.display = "inline"
        }
        const filteredBooks = initialBooks.filter(book => 
            book.volumeInfo.title.toLowerCase().includes(query) || 
            book.volumeInfo.authors?.some(author => author.toLowerCase().includes(query))
        );
        booksContainer.innerHTML = ""; // Clear previous results
        filteredBooks.forEach(filterBook => booksContainer.appendChild(createBookElement(filterBook)));
    });

    // Sort books based on selected criteria (title or date)
    sortOptions.addEventListener("change", () => {
        const sortBy = sortOptions.value;
        if (sortBy === "noSort") {
            booksContainer.innerHTML = "";
            initialBooks.forEach(Book => booksContainer.appendChild(createBookElement(Book)));
        } else {
            unsortedBooks.sort((a, b) => {
                if (sortBy === "title") return a.volumeInfo.title.localeCompare(b.volumeInfo.title);
                if (sortBy === "date") return (a.volumeInfo.publishedDate || "0").localeCompare(b.volumeInfo.publishedDate || "0");
            });
            booksContainer.innerHTML = "";
            unsortedBooks.forEach(sortBook => booksContainer.appendChild(createBookElement(sortBook)));
        }
    });

    // Toggle between Grid and List view
    toggleViewBtn.addEventListener("click", () => {
        isGridView = !isGridView;
    
        if (isGridView) {
            booksContainer.classList.add("grid-view");
            booksContainer.classList.remove("list-view");
            toggleViewBtn.textContent = "Switch to List View";
        } else {
            booksContainer.classList.add("list-view");
            booksContainer.classList.remove("grid-view");
            toggleViewBtn.textContent = "Switch to Grid View";
        }
    });

    // Load more books on button click (pagination)
    loadMoreBtn.addEventListener("click", () => {
        pageIndex += 1;
        if (pageIndex === 21) {
            loadMoreBtn.style.display = 'none'; // Hide button after max pages
        }
        fetchBooks();
    });

    // Initial fetch to load books when the page loads
    fetchBooks();
});
