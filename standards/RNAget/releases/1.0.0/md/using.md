# Using the API

## Supported RNA Data Types

**Expression** refers to feature-based quantifications.  The output from RNA-seq quantification software (e.g. RSEM, kallisto or Cell Ranger) is Expression data.  Features may be genes, transcripts or any annotated region of the genome.  Quantifications may be counts (raw or estimated) or calculated values such as TPM or FPKM.

**Continuous** refers to genomic coordinate-based counts at every base in an interval.  A wiggle file used for visualizing expression in a genome browser is an example of Continuous data.

## Selecting and Retrieving the RNA Data Matrix

RNAget supports two means of selecting RNA data: selection by ID and selection by metadata.  For each of these, the resultant matrix can either be downloaded as an inline attachment or a ticket object containing a download URL can be requested.  The API flow for both Expression and Continuous are nearly identical, differing only in data-type specific row/column filtering parameters.

Image

## Matrix selection by ID vs. matrix selection and joining by metadata

Expression and continuous matrices can be selected by one of two methods: by **ID** or **matrix metadata**, depending on the requested endpoint.

### Matrix selection by ID

Expression/continuous matrices can be stored as permanent objects and referenced by a single, persistent, unique identifier (ID). Using the ID as a path parameter, the client can request the associated matrix for download.

The client can also filter expression matrix rows/columns (by sampleIDList, featureIDList, and featureNameList query parameters) or continuous matrix columns (by chr, start, and end query parameters). This will result in a dynamically-generated matrix containing only the requested rows and columns found in the original matrix.

In summary, requesting a matrix by its ID will:
1. Find the matrix associated with the specified ID
2. (if filtering parameters provided) Filter the matrix, only providing the requested rows/columns
3. Make the new matrix available for download

The following API endpoints will return a single matrix according to the requested ID, its rows/columns filtered according to filter criteria:
- `/expressions/{expressionId}/ticket`
- `/expressions/{expressionId}/bytes`
- `/continuous/{continuousId}/ticket`
- `/continuous/{continuousId}/bytes`

### Matrix selection and joining by metadata

Each permanent matrix has associated metadata (version, parent project id, parent study id, etc). Using query string parameters, the client can request all matrices with metadata properties matching requested values. For example, the client can request all matrices with a parent study id of `f3ba0b59bed0fa2f1030e7cb508324d1`.

Matrices requested via this method are joined into a single matrix, containing all rows/columns. The client can also filter the joined matrix rows/columns by query parameters.

In summary, requesting a set of matrices by metadata properties will:
1. Find all matrices that match all requested metadata property values (i.e. AND filtering)
2. Combine the set of matrices into a single, joined matrix
3. (if filtering parameters provided) Filter the matrix, only providing the requested rows/columns
4. Make the new matrix available for download

The following API endpoints will join multiple matrices into a single matrix, then filter rows/columns according to filter criteria:
* `/expressions/ticket`
* `/continuous/ticket`
* `/expressions/bytes`
* `/continuous/bytes`

## Matrix Download: Ticket vs. Bytes

Expression and continuous matrices can be downloaded in one of two ways: by **ticket** or **bytes**, depending on the requested endpoint.

### Ticket

The JSON response from certain expression and continuous-related endpoints is a **ticket**, which provides the client with all information required to download the desired data in the specified format. The ticket contains a url (and optionally, auth or formatting headers) that the client can submit an additional request to in order to download a dynamically-generated matrix. Thus, the ticket API flow involves 2 requests to obtain the expression or continuous matrix: the first request obtains the ticket, and the second request returns the matrix from the url and headers specified in the ticket. The ticket flow, while more complex, is also modular, enabling additional auth mechanisms to access data.

The following API endpoints will return a JSON ticket:
* `/expressions/{expressionId}/ticket`
* `/expressions/ticket`
* `/continuous/{continuousId}/ticket`
* `/continuous/ticket`

### Bytes

In contrast to a JSON ticket request, a **bytes** request yields the matrix file directly. The bytes API flow involves a single request, the response of which contains the dynamically-generated matrix.

The following API endpoints will return matrix bytes directly:
* `/expressions/{expressionId}/bytes`
* `/expressions/bytes`
* `/continuous/{continuousId}/bytes`
* `/continuous/bytes`

Requests to ticket vs. bytes differ only in the overall API flow needed to download the matrix, not the matrix content itself. For example, the following requests will yield the exact same matrix:
* `/expressions/ac3e9279efd02f1c98de4ed3d335b98e/ticket`
* `/expressions/ac3e9279efd02f1c98de4ed3d335b98e/bytes`

