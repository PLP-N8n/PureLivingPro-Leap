interface WordPressPost {
  title: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'publish';
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  meta?: Record<string, any>;
}

interface WordPressResponse {
  id: number;
  link: string;
  status: string;
  title: {
    rendered: string;
  };
}

interface WordPressCredentials {
  baseUrl: string;
  username: string;
  password: string;
}

export async function createWordPressPost(creds: WordPressCredentials, post: WordPressPost): Promise<WordPressResponse> {
  const { baseUrl, username, password } = creds;

  if (!baseUrl || !username || !password) {
    throw new Error("WordPress credentials not configured");
  }

  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  
  try {
    const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(post)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WordPress API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create WordPress post:', error);
    throw error;
  }
}

export async function updateWordPressPost(
  creds: WordPressCredentials,
  postId: number, 
  updates: Partial<WordPressPost>
): Promise<WordPressResponse> {
  const { baseUrl, username, password } = creds;

  if (!baseUrl || !username || !password) {
    throw new Error("WordPress credentials not configured");
  }

  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  
  try {
    const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WordPress API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to update WordPress post:', error);
    throw error;
  }
}

export async function uploadWordPressMedia(
  creds: WordPressCredentials,
  file: Buffer, 
  filename: string, 
  mimeType: string
): Promise<{ id: number; source_url: string }> {
  const { baseUrl, username, password } = creds;

  if (!baseUrl || !username || !password) {
    throw new Error("WordPress credentials not configured");
  }

  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  
  try {
    const formData = new FormData();
    formData.append('file', new Blob([file], { type: mimeType }), filename);

    const response = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WordPress media upload error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to upload WordPress media:', error);
    throw error;
  }
}
