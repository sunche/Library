var LibraryUri = "http://localhost:1484/api/library/";
var ImagesUri = "http://localhost:1484/images/";
var UploadUri = "http://localhost:1484/api/upload";

// get guid.
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}

// check ISBN.
function isValidISBN(isbn) {
    isbn = isbn.replace(/[-\s]/gi, "");
    var chars;
    var sum;
    var i;
    if (isbn.length === 10) {
        chars = isbn.split("");
        if (chars[9].toUpperCase() === "X") {
            chars[9] = 10;
        }
        sum = 0;
        for (i = 0; i < chars.length; i++) {
            sum += ((10 - i) * parseInt(chars[i]));
        }
        return (sum % 11 === 0);
    } else if (isbn.length === 13) {
        chars = isbn.split("");
        sum = 0;
        for (i = 0; i < chars.length; i++) {
            if (i % 2 === 0) {
                sum += parseInt(chars[i]);
            } else {
                sum += parseInt(chars[i]) * 3;
            }
        }
        return (sum % 10 === 0);
    } else {
        return false;
    }
}

// Merge authors collection to string.
function getAuthorsString(authors) {
    return authors.map(function(author) { return author.name + " " + author.surname }).join(", ");
}

// Parse authors string to collection.
function getAuthors(authorsString) {
    const authorsNames = authorsString.replace(/\s+/gi, " ").replace(", ", ",").split(",");
    const authors = [];
    for (let authorName of authorsNames) {
        authors.push(authorName.split(" "));
    }

    return authors;
}

function getCookie(name) {
    const matches = document.cookie.match(new RegExp(
        `(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1")}=([^;]*)`
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

// Get cookie with sorting value;
function getSortingCookie() {
    return getCookie("sorting");
}

// Form to edit and to create a book.
var BookForm = React.createClass({
    getInitialState: function() {
        var state = {};
        if (this.props.isEditForm) {
            state = this.props.item;
            state.titleValid = this.getTitleValidation(state.title);
            state.pagesCountValid = this.getPagesCountValidation(state.pagesCount);
            state.publisherValid = this.getPublisherValidation(state.publisher);
            state.publishYearValid = this.getPublishYearValidation(state.publishYear);
            state.isbnValid = this.getIsbnValidation(state.isbn);
            state.authorsValid = this.getAuthorsValidation(state.authorsString);
            state.formValid = this.isFormValid(state);
        } else {
            state = {
                title: "",
                pagesCount: "",
                id: guid(),
                publisher: "",
                publishYear: "",
                isbn: "",
                authorsString: ""
            };
            state.titleValid = false;
            state.authorsValid = false;
            state.pagesCountValid = false;
            state.publisherValid = true;
            state.publishYearValid = true;
            state.isbnValid = true;
        }

        return state;
    },

    getAuthorsObjects: function(authorsString) {
        return getAuthors(authorsString).map(function(author) { return { name: author[0], surname: author[1] } });
    },

    getBookFromState: function(state) {
        return {
            title: state.title,
            pagesCount: state.pagesCount,
            id: state.id,
            publisher: state.publisher,
            publishYear: state.publishYear,
            isbn: state.isbn,
            authors: state.authors,
            imageUri: state.imageUri,
            authorsString: state.authorsString
        };
    },

    onSubmit: function(e) {
        e.preventDefault();
        const requestType = this.props.isEditForm ? "PUT" : "POST";
        this.state.authors = this.getAuthorsObjects(this.state.authorsString);
        // Upload image.
        if (this.state.imageName && this.state.imageName.length > 0) {
            $.ajax({
                    url: UploadUri,
                    type: "POST",
                    data: this.state.imageFormData,
                    processData: false,
                    contentType: false
                }).done()
                .fail(function(data, status, xhr) {
                    alert(data.responseText);
                });
            this.state.imageUri = this.state.imageName;
        }
        $.ajax({
                url: this.getSubmitUrl(),
                type: requestType,
                data: this.getBookFromState(this.state)
            }).done(this.onSuccess()
            )
            .fail(function(data, status, xhr) {
                alert(data.responseText);
            });
    },

    onSuccess: function() {
        var form = this;
        return function() {
            if (form.props.isEditForm) {
                form.props.onBookUpdated(form.getBookFromState(form.state));
            } else {
                form.props.onBookAdded(form.getBookFromState(form.state));
            }
            form.setState(form.getInitialState());
        };
    },

    onChange: function(e) {
        const name = e.target.name;
        const value = e.target.value;
        if (name === "image") {
            if (e.target.files.length > 0) {
                const fd = new FormData();
                fd.append("file", e.target.files[0]);

                this.setState({
                    imageName: e.target.files[0].name,
                    imageFormData: fd
                });
            } else {
                this.setState({
                    imageName: "",
                    imageFormData: null
                });
            }
        }
        this.setState({ [name]: value },
            () => { this.validateField(name, value) });
    },

    validateField: function(fieldName, value) {
        const curState = this.state;
        switch (fieldName) {
        case "title":
            curState.titleValid = this.getTitleValidation(value);
            break;
        case "authorsString":
            curState.authorsValid = this.getAuthorsValidation(value);
            break;
        case "pagesCount":
            curState.pagesCountValid = this.getPagesCountValidation(value);
            break;
        case "publisher":
            curState.publisherValid = this.getPublisherValidation(value);
            break;
        case "publishYear":
            curState.publishYearValid = this.getPublishYearValidation(value);
            break;
        case "isbn":
            curState.isbnValid = this.getIsbnValidation(value);
            break;
        }

        this.setState(curState, this.validateForm);
    },

    getTitleValidation: function(value) {
        return value.length > 0 && value.length <= 30;
    },

    getAuthorsValidation: function(value) {
        var isValid = true;
        const authors = getAuthors(value);
        for (let author of authors) {
            if (author.length !== 2 ||
                author[0].length === 0 ||
                author[0].length > 20 ||
                author[1].length === 0 ||
                author[1].length > 20) {
                isValid = false;
                {
                    break;
                }
            }
        }
        return isValid;
    },

    getPagesCountValidation: function(value) {
        return value > 0 && value < 10000;
    },

    getPublisherValidation: function(value) {
        return value == null || value.length === 0 || value.length <= 30;
    },

    getPublishYearValidation: function(value) {
        return value == null || value.length === 0 || value >= 1800;
    },

    getIsbnValidation: function(value) {
        return value == null || value.length === 0 || isValidISBN(value);
    },

    validateForm: function() {
        this.setState({
            formValid: this.isFormValid(this.state)
        });
    },

    isFormValid: function(state) {
        return state.titleValid &&
            state.authorsValid &&
            state.pagesCountValid &&
            state.publisherValid &&
            state.publishYearValid &&
            state.isbnValid;
    },

    getBtnTitle: function() {
        if (this.props.isEditForm) {
            return "Edit";
        }
        return "Create book";
    },

    getSubmitBtnTitle: function() {
        if (this.props.isEditForm) {
            return "Save changes";
        }
        return "Create book";
    },

    getSubmitUrl: function() {
        if (this.props.isEditForm) {
            const url = LibraryUri + this.state.id;
            return url;

        }
        return LibraryUri;
    },

    getTargetId: function() {
        return `#${this.state.id}`;
    },

    getInvalidState: function(validationProperty) {
        if (this.state[validationProperty]) {
            return "";
        }
        return "is-invalid";
    },

    render: function() {
        return (
            <div className="row">
                <button type="button" className="btn btn-primary" data-toggle="modal" data-target={this.getTargetId()}>
                    {this.getBtnTitle()}
                </button>
                <div className="modal fade" id={this.state.id} tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Details</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form ref="book_form">
                                    <div className="form-group">
                                        <label htmlFor={`title${this.state.id}`}>Title:*</label>
                                        <input id={`title${this.state.id}`} name="title" ref="title" type="text" className={`form-control ${this.getInvalidState("titleValid")}`} placeholder="Title" onChange={this.onChange} value={this.state.title}/>
                                        <div className="invalid-feedback">Title must be less than 30 characters</div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor={`authors${this.state.id}`}>Authors:*</label>
                                        <input id={`authors${this.state.id}`} name="authorsString" ref="authorsString" type="text" className={`form-control ${this.getInvalidState("authorsValid")}`} placeholder="Authors" onChange={this.onChange} value={this.state.authorsString}/>
                                        <div className="invalid-feedback">Authors must have name as first word and surname as second word, each should be less than 20 characters. Multiple authors should be separated by comma</div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor={`pagesCount${this.state.id}`}>Pages count:*</label>
                                        <input id={`pagesCount${this.state.id}`} name="pagesCount" ref="pagesCount" type="text" className={`form-control ${this.getInvalidState("pagesCountValid")}`} placeholder="Pages..." onChange={this.onChange} value={this.state.pagesCount}/>
                                        <div className="invalid-feedback">Pages count must be less than 10000</div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor={`publisher${this.state.id}`}>Publisher:</label>
                                        <input id={`publisher${this.state.id}`} name="publisher" ref="publisher" type="text" className={`form-control ${this.getInvalidState("publisherValid")}`} placeholder="Publisher..." onChange={this.onChange} value={this.state.publisher}/>
                                        <div className="invalid-feedback">Publisher must be less than 30 characters</div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor={`publishYear${this.state.id}`}>Publish Year:</label>
                                        <input id={`publishYear${this.state.id}`} name="publishYear" ref="publishYear" type="text" className={`form-control ${this.getInvalidState("publishYearValid")}`} placeholder="Publish year..." onChange={this.onChange} value={this.state.publishYear}/>
                                        <div className="invalid-feedback">Publish year must be greater than 1800</div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor={`isbn${this.state.id}`}>ISBN:</label>
                                        <input id={`isbn${this.state.id}`} name="isbn" ref="isbn" type="text" className={`form-control ${this.getInvalidState("isbnValid")}`} placeholder="ISBN..." onChange={this.onChange} value={this.state.isbn}/>
                                        <div className="invalid-feedback">Invalid ISBN</div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor={`img${this.state.id}`}>Choose image for book:</label>
                                        <input ref="image" type="file" name="image" className="form-control-file" id={
`img${this.state.id}`} onChange={this.onChange}/>
                                    </div>
                                    <div className="form-group">
                                        <small>* - required fields</small>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                <button type="button" disabled={!this.state.formValid
} className="btn btn-primary" onClick={this.onSubmit
                                } data-dismiss="modal">{this.getSubmitBtnTitle()}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

// Component to render image in table cell.
var ImageTD = React.createClass({
    render: function() {
        if (this.props.imageUri) {
            return <td >
                       <a href={ImagesUri + this.props.imageUri} target="_blank">
                           <img async src={ImagesUri + this.props.imageUri} height="100" alt="image"/>
                       </a>
                   </td >;
        } else {
            return <td ></td >;
        }
    }
});

// Grid row with book's information.
var BookRow = React.createClass({
    getInitialState: function() {
        return this.props.item;
    },

    updateBook: function(book) {
        this.setState(book);
    },

    deleteBook: function() {
        this.props.onDeleteBook(this.state.id);
    },

    render: function() {

        return (
            <tr>
                <ImageTD imageUri={this.state.imageUri}/>
                <td>{this.state.title}</td>
                <td>{this.state.authorsString}</td>
                <td>{this.state.pagesCount}</td>
                <td>{this.state.publisher}</td>
                <td>{this.state.publishYear}</td>
                <td className="isbn">{this.state.isbn}</td>
                <td>
                    <button type="button" className="btn btn-danger" onClick={this.deleteBook}>Delete</button>
                </td>
                <td>
                    <BookForm isEditForm={true} item={this.state} onBookUpdated={this.updateBook}/>
                </td>
            </tr>
        );
    }
});

// Grid with books.
var BookTable = React.createClass({
    deleteBook: function(id) {
        this.props.onDeleteBook(id);
    },

    sortByTitle: function() {
        this.props.onSortTitle("title");
    },

    sortByPublishYear: function() {
        this.props.onSortTitle("publishYear");
    },

    // get title caption with sorting arrow.
    getTitleCaption: function() {
        let result = "Title";
        const sorting = getSortingCookie();
        if (sorting === "SortByTitleAsc") {
            result += ` ${String.fromCharCode(8595)}`;
        } else if (sorting === "SortByTitleDesc") {
            result += ` ${String.fromCharCode(8593)}`;
        }
        return result;
    },

    // get publish year caption with sorting arrow.
    getYearCaption: function() {
        let result = "Year";
        const sorting = getSortingCookie();
        if (sorting === "SortByPublishYearAsc") {
            result += ` ${String.fromCharCode(8595)}`;
        } else if (sorting === "SortByPublishYearDesc") {
            result += ` ${String.fromCharCode(8593)}`;
        }
        return result;
    },

    render: function() {
        var rows = [];
        this.props.data.forEach(function(item) {
                item.authorsString = getAuthorsString(item.authors);
                rows.push(<BookRow key={item.id} item={item} onDeleteBook={this.deleteBook}/>);
            },
            this);
        return (<table className="table">
                    <thead>
                    <tr>
                        <th></th>
                        <th onClick={this.sortByTitle} className="sort">{this.getTitleCaption()}</th>
                        <th>Authors</th>
                        <th>Pages</th>
                        <th>Publisher</th>
                        <th onClick={this.sortByPublishYear} className="sort">{this.getYearCaption()}</th>
                        <th>ISBN</th>
                        <th></th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </table>);
    }
});

// main component.
var Library = React.createClass({
    getInitialState: function() {
        return {
            data: []
        };
    },

    componentWillMount: function() {
        // load books after rendering.
        $.get(LibraryUri, this.updateState);
    },

    // when update state check for sorting.
    updateState: function(data) {
        const sorting = getSortingCookie();
        var books = data;
        var sortingField = "";
        var isSortByAsc = false;
        if (sorting != null) {
            switch (sorting) {
            case "SortByTitleAsc":
                isSortByAsc = true;
            case "SortByTitleDesc":
                sortingField = "title";
                break;
            case "SortByPublishYearAsc":
                isSortByAsc = true;
            case "SortByPublishYearDesc":
                sortingField = "publishYear";
                break;
            }

            books = this.getSortedBooks(books, sortingField, isSortByAsc);
        }

        this.setState({ data: books });
    },

    onNewBookAdded: function(book) {
        const books = this.state.data.concat([book]);
        this.updateState(books);
    },

    onBookDeleted: function(id) {
        var deletedBookId = id;
        var component = this;
        return function() {
            let books = component.state.data;

            for (let i in books) {
                if (books[i].id === deletedBookId) {
                    books.splice(i, 1);
                    break;
                }
            }
            component.updateState(books);
        };

    },

    // sorting by field using cookie
    sort: function(fieldName) {
        const sorting = getSortingCookie();
        if (fieldName === "title") {
            if (sorting == null || sorting !== "SortByTitleAsc") {
                this.setSortingCookie("SortByTitleAsc");
            } else {
                this.setSortingCookie("SortByTitleDesc");
            }
        } else if (fieldName === "publishYear") {
            if (sorting == null || sorting !== "SortByPublishYearAsc") {
                this.setSortingCookie("SortByPublishYearAsc");
            } else {
                this.setSortingCookie("SortByPublishYearDesc");
            }
        }
        this.updateState(this.state.data);
    },

    // sort and return books collection by input arguments
    getSortedBooks: function(books, fieldName, isAsc) {
        var result = [];
        const firstValue = books[0][fieldName];
        // sorting for title
        if (isNaN(firstValue)) {
            if (isAsc) {
                result = books.sort((a, b) => a[fieldName].localeCompare(b[fieldName]));
            } else {
                result = books.sort((a, b) => b[fieldName].localeCompare(a[fieldName]));
            }
            // sortinf for year
        } else {
            if (isAsc) {
                result = books.sort((a, b) => (a[fieldName] - b[fieldName]));
            } else {
                result = books.sort((a, b) => (b[fieldName] - a[fieldName]));
            }
        }
        return result;
    },

    setSortingCookie: function(value) {
        document.cookie = `sorting=${value};`;
    },

    deleteBook: function(id) {
        $.ajax({
                url: LibraryUri + id,
                type: "DELETE"
            }).done(this.onBookDeleted(id))
            .fail(function(data, status, xhr) {
                alert(data.responseText);
            });
    },

    render: function() {
        return (<div>
                    <div>
                        <BookTable key="Library" data={this.state.data} onSortTitle={this.sort} onDeleteBook={this
                            .deleteBook}/>
                    </div>
                    <div>
                        <BookForm onBookAdded={this.onNewBookAdded} isEditForm={false}/>
                    </div>
                </div>
        );
    }
});

ReactDOM.render(<Library/>,
    document.getElementById("container"));