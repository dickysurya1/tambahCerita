import LoginView from '../mvp/views/LoginView';
import LoginPresenter from '../mvp/presenters/LoginPresenter';
import RegisterView from '../mvp/views/RegisterView';
import RegisterPresenter from '../mvp/presenters/RegisterPresenter';
import HomeView from '../mvp/views/HomeView';
import HomePresenter from '../mvp/presenters/HomePresenter';
import AboutView from '../mvp/views/AboutView';
import AboutPresenter from '../mvp/presenters/AboutPresenter';
import DetailView from '../mvp/views/DetailView';
import DetailPresenter from '../mvp/presenters/DetailPresenter';
import AddView from '../mvp/views/AddView';
import AddPresenter from '../mvp/presenters/AddPresenter';
import SavedStoriesPage from '../pages/saved-stories';
import NotFound from '../pages/not-found';

const routes = {
  '/': {
    render: async () => {
      const view = new HomeView();
      const presenter = new HomePresenter(view);
      await presenter.init();
      return view;
    }
  },
  '/about': {
    render: async () => {
      const view = new AboutView();
      const presenter = new AboutPresenter(view);
      await presenter.init();
      return view;
    }
  },
  '/detail/:id': {
    render: async () => {
      const view = new DetailView();
      const presenter = new DetailPresenter(view);
      await presenter.init();
      return view;
    }
  },
  '/add': {
    render: async () => {
      const view = new AddView();
      const presenter = new AddPresenter(view);
      await presenter.init();
      return view;
    }
  },
  '/login': {
    render: async () => {
      const view = new LoginView();
      const presenter = new LoginPresenter(view);
      await presenter.init();
      return view;
    }
  },
  '/register': {
    render: async () => {
      const view = new RegisterView();
      const presenter = new RegisterPresenter(view);
      await presenter.init();
      return view;
    }
  },
  '/saved': {
    render: async () => {
      return SavedStoriesPage;
    }
  },
  '*': {
    render: async () => {
      return NotFound;
    }
  }
};

export default routes;