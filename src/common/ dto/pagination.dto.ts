export class PaginationDto<T> {
    items: T[];  
    total: number;  
    totalPages: number; 
    currentPage: number; 
    pageSize: number;  
  
    constructor(items: T[], total: number, totalPages: number, currentPage: number, pageSize: number) {
      this.items = items;
      this.total = total;
      this.totalPages = totalPages;
      this.currentPage = currentPage;
      this.pageSize = pageSize;
    }
  }
  