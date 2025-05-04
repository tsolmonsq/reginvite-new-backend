import { Injectable } from '@nestjs/common';

@Injectable()
export class PaginationService {
  applyPagination(query: any, page: number, limit: number) {
    query.skip((page - 1) * limit);  
    query.take(limit); 
    return query;
  }

  calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }
}
