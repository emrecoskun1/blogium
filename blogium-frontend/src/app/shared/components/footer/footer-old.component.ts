import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <div class="brand">
              <span class="brand-logo">B</span>
              <span class="brand-name">Blogium</span>
            </div>
            <p class="footer-text">
              A place to read, write, and deepen your understanding of the topics that matter most to you.
            </p>
          </div>

          <div class="footer-links">
            <div class="link-group">
              <h4>Platform</h4>
              <a routerLink="/about">About</a>
              <a routerLink="/contact">Contact</a>
              <a routerLink="/careers">Careers</a>
            </div>

            <div class="link-group">
              <h4>Legal</h4>
              <a routerLink="/terms">Terms</a>
              <a routerLink="/privacy">Privacy</a>
              <a routerLink="/cookies">Cookies</a>
            </div>

            <div class="link-group">
              <h4>Resources</h4>
              <a routerLink="/help">Help Center</a>
              <a routerLink="/guidelines">Guidelines</a>
              <a routerLink="/api">API</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} Blogium. All rights reserved.</p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Twitter">𝕏</a>
            <a href="#" class="social-link" aria-label="GitHub">GitHub</a>
            <a href="#" class="social-link" aria-label="LinkedIn">in</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #242424;
      color: #b3b3b3;
      margin-top: 120px;
      padding: 60px 0 24px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .footer-content {
      display: grid;
      grid-template-columns: 2fr 3fr;
      gap: 60px;
      margin-bottom: 48px;
    }

    .footer-section {
      max-width: 400px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .brand-logo {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      font-weight: 700;
    }

    .brand-name {
      color: white;
      font-size: 20px;
      font-weight: 700;
    }

    .footer-text {
      font-size: 14px;
      line-height: 1.6;
      color: #8c8c8c;
    }

    .footer-links {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
    }

    .link-group h4 {
      color: white;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .link-group a {
      display: block;
      color: #8c8c8c;
      text-decoration: none;
      font-size: 14px;
      margin-bottom: 12px;
      transition: color 0.2s;
    }

    .link-group a:hover {
      color: white;
    }

    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 24px;
      border-top: 1px solid #3a3a3a;
    }

    .footer-bottom p {
      font-size: 13px;
      color: #6b6b6b;
      margin: 0;
    }

    .social-links {
      display: flex;
      gap: 16px;
    }

    .social-link {
      color: #8c8c8c;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }

    .social-link:hover {
      color: white;
    }

    @media (max-width: 768px) {
      .footer {
        margin-top: 60px;
        padding: 40px 0 20px;
      }

      .footer-content {
        grid-template-columns: 1fr;
        gap: 40px;
        margin-bottom: 32px;
      }

      .footer-links {
        grid-template-columns: 1fr;
        gap: 32px;
      }

      .footer-bottom {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {
  protected readonly currentYear = new Date().getFullYear();
}
