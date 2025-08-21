interface MediumPost {
  title: string;
  content: string;
  contentFormat: 'html' | 'markdown';
  publishStatus: 'draft' | 'public';
  tags?: string[];
  canonicalUrl?: string;
}

interface MediumResponse {
  id: string;
  title: string;
  authorId: string;
  url: string;
  publishStatus: string;
}

export async function publishToMedium(
  token: string,
  authorId: string, 
  post: MediumPost
): Promise<MediumResponse> {
  if (!token) {
    throw new Error("Medium token not configured");
  }

  try {
    const response = await fetch(`https://api.medium.com/v1/users/${authorId}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(post)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Medium API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to publish to Medium:', error);
    throw error;
  }
}

export async function getMediumUser(token: string): Promise<{ id: string; username: string; name: string }> {
  if (!token) {
    throw new Error("Medium token not configured");
  }

  try {
    const response = await fetch('https://api.medium.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Medium API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to get Medium user:', error);
    throw error;
  }
}
