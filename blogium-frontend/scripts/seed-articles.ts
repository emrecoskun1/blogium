/**
 * Script to seed 1000 test articles for pagination testing
 *
 * Usage:
 * 1. Make sure backend is running on http://localhost:5000
 * 2. Make sure you have a registered user account
 * 3. Update the login credentials below
 * 4. Run: npx ts-node scripts/seed-articles.ts
 */

interface AuthResponse {
  user: {
    email: string;
    token: string;
    username: string;
    bio: string;
    image: string | null;
  };
}

interface ArticleResponse {
  article: {
    slug: string;
    title: string;
    description: string;
    body: string;
    tagList: string[];
    createdAt: string;
    updatedAt: string;
    favorited: boolean;
    favoritesCount: number;
    author: any;
  };
}

const API_URL = 'http://localhost:5000/api';

// Update these credentials with your test user
const TEST_USER = {
  email: 'test2025@example.com',
  password: 'Test123'
};

const ARTICLE_TITLES = [
  'Understanding JavaScript Closures',
  'Introduction to TypeScript Generics',
  'Building Scalable APIs with Node.js',
  'React Hooks Deep Dive',
  'Angular Best Practices for 2025',
  'Vue.js Composition API Guide',
  'Docker Containerization Tutorial',
  'Kubernetes for Beginners',
  'GraphQL vs REST API',
  'MongoDB Schema Design Patterns',
  'PostgreSQL Performance Optimization',
  'Redis Caching Strategies',
  'Microservices Architecture Explained',
  'SOLID Principles in Practice',
  'Clean Code Best Practices',
  'Test-Driven Development Guide',
  'CI/CD Pipeline Setup',
  'AWS Lambda Functions Tutorial',
  'Azure DevOps Complete Guide',
  'Google Cloud Platform Basics',
  'Machine Learning with Python',
  'Deep Learning Fundamentals',
  'Natural Language Processing',
  'Computer Vision Applications',
  'Blockchain Technology Explained',
  'Web Security Best Practices',
  'OAuth 2.0 Authentication',
  'JWT Token Management',
  'CSS Grid Layout Mastery',
  'Flexbox Complete Guide',
  'Responsive Web Design Patterns',
  'Progressive Web Apps',
  'Service Workers Tutorial',
  'WebAssembly Introduction',
  'Git Workflow Strategies',
  'Code Review Best Practices',
  'Agile Development Methodology',
  'Scrum Framework Guide',
  'DevOps Culture and Practices',
  'Software Architecture Patterns'
];

const DESCRIPTIONS = [
  'A comprehensive guide to mastering this important concept',
  'Learn the fundamentals and advanced techniques',
  'Step-by-step tutorial with practical examples',
  'Everything you need to know to get started',
  'Best practices and common pitfalls to avoid',
  'Deep dive into the core concepts and patterns',
  'Practical tips and tricks from industry experts',
  'Complete walkthrough with real-world applications',
  'Understanding the underlying principles and implementation',
  'Expert insights and professional recommendations'
];

const TAGS = [
  ['javascript', 'programming', 'web'],
  ['typescript', 'javascript', 'types'],
  ['nodejs', 'backend', 'api'],
  ['react', 'frontend', 'javascript'],
  ['angular', 'typescript', 'frontend'],
  ['vue', 'javascript', 'frontend'],
  ['docker', 'devops', 'containers'],
  ['kubernetes', 'devops', 'orchestration'],
  ['graphql', 'api', 'backend'],
  ['mongodb', 'database', 'nosql'],
  ['postgresql', 'database', 'sql'],
  ['redis', 'cache', 'database'],
  ['microservices', 'architecture', 'backend'],
  ['solid', 'design', 'patterns'],
  ['cleancode', 'bestpractices', 'programming'],
  ['tdd', 'testing', 'development'],
  ['cicd', 'devops', 'automation'],
  ['aws', 'cloud', 'serverless'],
  ['azure', 'cloud', 'devops'],
  ['gcp', 'cloud', 'google']
];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
  'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800'
];

function generateBody(index: number): string {
  return `
# Article ${index}

This is a test article generated for pagination testing. It contains enough content to meet the minimum requirements.

## Introduction

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## Main Content

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Key Points

1. First important point about this topic
2. Second critical aspect to consider
3. Third essential concept to understand
4. Fourth valuable insight to remember
5. Fifth crucial detail to note

## Code Example

\`\`\`javascript
function example() {
  console.log('This is a code example');
  return true;
}
\`\`\`

## Conclusion

In summary, this article covers the essential aspects of the topic. The key takeaways are important for understanding the broader context and practical applications.

### Further Reading

- Resource 1: Additional information
- Resource 2: Deep dive tutorial
- Resource 3: Community discussions
- Resource 4: Official documentation

Thank you for reading this test article!
  `.trim();
}

async function login(): Promise<string> {
  console.log('🔐 Logging in...');

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Login failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data: AuthResponse = await response.json();
  console.log(`✅ Logged in as ${data.user.username}`);
  return data.user.token;
}

async function createArticle(token: string, index: number): Promise<void> {
  const titleIndex = index % ARTICLE_TITLES.length;
  const descIndex = index % DESCRIPTIONS.length;
  const tagIndex = index % TAGS.length;
  const imageIndex = index % SAMPLE_IMAGES.length;

  const article = {
    title: `${ARTICLE_TITLES[titleIndex]} - Part ${Math.floor(index / ARTICLE_TITLES.length) + 1}`,
    description: `${DESCRIPTIONS[descIndex]} (Article #${index + 1})`,
    body: generateBody(index + 1),
    tagList: TAGS[tagIndex],
    image: SAMPLE_IMAGES[imageIndex]
  };

  const response = await fetch(`${API_URL}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(article)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create article ${index + 1}: ${response.status} - ${errorText}`);
  }

  const data: ArticleResponse = await response.json();
  return;
}

async function seedArticles(count: number = 1000) {
  console.log(`\n🌱 Starting to seed ${count} articles...\n`);

  try {
    // Login first
    const token = await login();

    // Create articles in batches to avoid overwhelming the server
    const batchSize = 10;
    const delay = 100; // ms between batches

    let created = 0;
    let failed = 0;

    for (let i = 0; i < count; i += batchSize) {
      const batch = Math.min(batchSize, count - i);
      const promises: Promise<void>[] = [];

      for (let j = 0; j < batch; j++) {
        const articleIndex = i + j;
        promises.push(
          createArticle(token, articleIndex)
            .then(() => {
              created++;
              if (created % 50 === 0) {
                console.log(`📝 Created ${created}/${count} articles...`);
              }
            })
            .catch((error) => {
              failed++;
              console.error(`❌ Failed to create article ${articleIndex + 1}: ${error.message}`);
            })
        );
      }

      await Promise.all(promises);

      // Small delay between batches
      if (i + batchSize < count) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   - Successfully created: ${created} articles`);
    console.log(`   - Failed: ${failed} articles`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
const articleCount = process.argv[2] ? parseInt(process.argv[2]) : 1000;
seedArticles(articleCount);
