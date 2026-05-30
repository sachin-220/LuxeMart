const validatePagination = (req, res, next) => {
    let { page, limit } = req.query;
    
    // Convert to integers
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    
    // Validate and sanitize
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;
    
    req.query.page = page;
    req.query.limit = limit;
    
    next();
};

const sanitizeSearch = (req, res, next) => {
    if (req.query.search) {
        // Remove characters that might be used for NoSQL injection or Regex abuse
        req.query.search = req.query.search.toString().replace(/[^\w\s-]/gi, '').trim();
    }
    next();
};

module.exports = { validatePagination, sanitizeSearch };
