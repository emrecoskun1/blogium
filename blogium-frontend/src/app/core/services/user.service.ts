import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, UserProfile } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  getProfile(username: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${username}`).pipe(
      catchError(error => {
        console.error('Get profile error:', error);
        throw error;
      })
    );
  }

  followUser(username: string): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users/${username}/follow`, {}).pipe(
      catchError(error => {
        console.error('Follow user error:', error);
        throw error;
      })
    );
  }

  unfollowUser(username: string): Observable<User> {
    return this.http.delete<User>(`${environment.apiUrl}/users/${username}/follow`).pipe(
      catchError(error => {
        console.error('Unfollow user error:', error);
        throw error;
      })
    );
  }
}
