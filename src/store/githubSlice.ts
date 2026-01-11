import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface GitHubProfile {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
}

interface GitHubState {
  profile: GitHubProfile | null;
  repos: GitHubRepo[];
  loading: boolean;
  error: string | null;
}

const initialState: GitHubState = {
  profile: null,
  repos: [],
  loading: false,
  error: null,
};

export const fetchGitHubData = createAsyncThunk(
  'github/fetchData',
  async (username: string, { rejectWithValue }) => {
    try {
      const [profileRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`),
      ]);

      if (!profileRes.ok || !reposRes.ok) {
        throw new Error('Failed to fetch GitHub data');
      }

      const profile = await profileRes.json();
      const repos = await reposRes.json();

      return { profile, repos };
    } catch (error) {
      return rejectWithValue('Failed to fetch GitHub data');
    }
  }
);

const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGitHubData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGitHubData.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
        state.repos = action.payload.repos;
      })
      .addCase(fetchGitHubData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default githubSlice.reducer;
