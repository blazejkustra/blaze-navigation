import { render, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { NavigationProvider } from '../NavigationProvider';
import { createRouter } from '../createRouter';
import { navigate, goBack, replace } from '../navigation';

jest.mock('react-native-screens');

const HomeScreen = () => <Text>Home</Text>;
const DetailsScreen = () => <Text>Details</Text>;
const AboutScreen = () => <Text>About</Text>;

const router = createRouter({
  routes: {
    app: {
      navigator: 'stack',
      children: {
        home: { component: HomeScreen },
        details: { component: DetailsScreen },
        about: { component: AboutScreen },
      },
    },
  },
});

describe('NavigationProvider', () => {
  it('renders children and provides context', () => {
    const { getByText } = render(
      <NavigationProvider router={router}>
        <Text>Child Content</Text>
      </NavigationProvider>
    );

    expect(getByText('Child Content')).toBeTruthy();
  });

  it('renders initial route from config', () => {
    const { getByText } = render(
      <NavigationProvider router={router} />
    );

    expect(getByText('Home')).toBeTruthy();
  });

  it('navigate() triggers re-render with new screen', () => {
    const { getByText } = render(
      <NavigationProvider router={router} />
    );

    expect(getByText('Home')).toBeTruthy();

    act(() => {
      navigate('/app/details');
    });

    expect(getByText('Details')).toBeTruthy();
  });

  it('goBack() removes top screen', () => {
    const { getByText, queryByText } = render(
      <NavigationProvider router={router} />
    );

    act(() => {
      navigate('/app/details');
    });

    expect(getByText('Details')).toBeTruthy();

    act(() => {
      goBack();
    });

    expect(queryByText('Details')).toBeNull();
    expect(getByText('Home')).toBeTruthy();
  });

  it('replace() swaps top entry without adding history', () => {
    const { getByText, queryByText } = render(
      <NavigationProvider router={router} />
    );

    act(() => {
      navigate('/app/details');
    });

    expect(getByText('Details')).toBeTruthy();

    act(() => {
      replace('/app/about');
    });

    expect(getByText('About')).toBeTruthy();
    // Details should be gone (replaced)
    expect(queryByText('Details')).toBeNull();
  });
});
